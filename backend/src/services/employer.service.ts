import { prisma } from '../lib/prisma';
import { uploadToCloudinary } from '../lib/cloudinary';
import { sendApplicationStatusEmail, sendInterviewInviteEmail } from '../utils/email';
import { createNotification } from './notification.service';
import { JobStatus, ApplicationStatus, ApplicationTag, NotificationType, InterviewStatus, JobTier } from '../generated/prisma/client';
import { paymentService, boostedUntilForTier } from './payment.service';
import { skillService } from './skill.service';

export const employerService = {
  async getProfile(userId: string) {
    const employer = await prisma.employer.findUnique({
      where: { userId },
      include: { _count: { select: { jobs: true } } },
    });
    if (!employer) throw Object.assign(new Error('Không tìm thấy hồ sơ công ty'), { status: 404 });
    return employer;
  },

  async updateProfile(userId: string, data: Record<string, unknown>, logoBuffer?: Buffer) {
    const employer = await prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw Object.assign(new Error('Không tìm thấy hồ sơ công ty'), { status: 404 });
    let logoUrl = employer.logoUrl;
    if (logoBuffer) {
      logoUrl = await uploadToCloudinary(logoBuffer, 'employer-logos', 'image');
    }
    return prisma.employer.update({ where: { userId }, data: { ...data, logoUrl } });
  },

  async createJob(userId: string, data: Record<string, unknown>) {
    const employer = await prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw Object.assign(new Error('Không tìm thấy hồ sơ công ty'), { status: 404 });

    // Fraud detection rules
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [duplicateCount, dailyCount] = await Promise.all([
      prisma.job.count({
        where: {
          employerId: employer.id,
          title: { equals: data.title as string, mode: 'insensitive' },
          createdAt: { gte: since24h },
        },
      }),
      prisma.job.count({
        where: {
          employerId: employer.id,
          createdAt: { gte: since24h },
        },
      }),
    ]);

    let isFlagged = false;
    let flagReason: string | undefined;

    if (duplicateCount > 0) {
      isFlagged = true;
      flagReason = 'Trùng tiêu đề trong vòng 24 giờ';
    } else if (dailyCount >= 10) {
      isFlagged = true;
      flagReason = `Đăng quá 10 tin trong 24 giờ (${dailyCount + 1} tin)`;
    }

    const tier = ((data.tier as JobTier | undefined) ?? 'BASIC') as JobTier;
    const boostedUntil = boostedUntilForTier(tier);

    const rawSlugs = Array.isArray(data.skillSlugs) ? (data.skillSlugs as string[]) : [];
    if (rawSlugs.length > 0) {
      const { invalid } = await skillService.validateSlugs(rawSlugs);
      if (invalid.length > 0) {
        throw Object.assign(new Error('Có kỹ năng không hợp lệ'), {
          status: 422,
          code: 'INVALID_SKILLS',
          invalidSkills: invalid,
        });
      }
    }
    const skillSlugs = Array.from(new Set(rawSlugs));

    // Atomic: insert Job first, then consume credit (so CreditTransaction.jobId FK valid).
    // If credit insufficient → throw → tx rollback → Job not committed.
    const { tier: _tier, skillSlugs: _slugs, ...rest } = data as Record<string, unknown> & { tier?: JobTier; skillSlugs?: string[] };
    void _tier; void _slugs;
    return prisma.$transaction(async (tx) => {
      const newJob = await tx.job.create({
        data: {
          ...rest,
          expiresAt: new Date(data.expiresAt as string),
          employerId: employer.id,
          status: JobStatus.PENDING,
          tier,
          boostedUntil,
          skillSlugs,
          isFlagged,
          ...(flagReason && { flagReason }),
        } as Parameters<typeof tx.job.create>[0]['data'],
      });
      await paymentService.consumeCredit(employer.id, tier, newJob.id, tx);
      return newJob;
    }).then((job) => { skillService.triggerRecompute(); return job; });
  },

  async getMyJobs(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { employer: { userId } };
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { applications: true } } },
      }),
      prisma.job.count({ where }),
    ]);
    return { jobs, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getJob(userId: string, jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { employer: true, _count: { select: { applications: true } } },
    });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    return job;
  },

  async updateJob(userId: string, jobId: string, data: Record<string, unknown>) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    const updateData: Record<string, unknown> = { ...data };
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt as string);
    delete updateData.status;
    if (Array.isArray(data.skillSlugs)) {
      const rawSlugs = data.skillSlugs as string[];
      if (rawSlugs.length > 0) {
        const { invalid } = await skillService.validateSlugs(rawSlugs);
        if (invalid.length > 0) {
          throw Object.assign(new Error('Có kỹ năng không hợp lệ'), {
            status: 422,
            code: 'INVALID_SKILLS',
            invalidSkills: invalid,
          });
        }
      }
      updateData.skillSlugs = Array.from(new Set(rawSlugs));
    }
    const updated = await prisma.job.update({ where: { id: jobId }, data: updateData as Parameters<typeof prisma.job.update>[0]['data'] });
    skillService.triggerRecompute();
    return updated;
  },

  async deleteJob(userId: string, jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    await prisma.job.delete({ where: { id: jobId } });
    skillService.triggerRecompute();
  },

  async toggleJobStatus(userId: string, jobId: string, action: 'pause' | 'resume') {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    if (action === 'pause' && job.status !== JobStatus.ACTIVE)
      throw Object.assign(new Error('Chỉ có thể tạm dừng tin đang active'), { status: 400 });
    if (action === 'resume' && job.status !== JobStatus.PAUSED)
      throw Object.assign(new Error('Chỉ có thể khôi phục tin đang tạm dừng'), { status: 400 });
    const newStatus = action === 'pause' ? JobStatus.PAUSED : JobStatus.ACTIVE;
    const updated = await prisma.job.update({ where: { id: jobId }, data: { status: newStatus } });
    skillService.triggerRecompute();
    return updated;
  },

  async getJobApplications(userId: string, jobId: string, page: number, limit: number, status?: string, tag?: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { jobId };
    if (status && Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
      where.status = status as ApplicationStatus;
    }
    if (tag === 'NONE') {
      where.tag = null;
    } else if (tag && Object.values(ApplicationTag).includes(tag as ApplicationTag)) {
      where.tag = tag as ApplicationTag;
    }
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          candidate: {
            include: { user: { select: { email: true } } },
          },
          screeningAnswers: {
            select: {
              id: true,
              answer: true,
              question: { select: { question: true, type: true } },
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);
    return { applications, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async updateApplicationStatus(userId: string, jobId: string, appId: string, status: ApplicationStatus, note?: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    const application = await prisma.application.findFirst({
      where: { id: appId, jobId },
      include: { candidate: { include: { user: { select: { email: true } } } } },
    });
    if (!application) throw Object.assign(new Error('Không tìm thấy đơn ứng tuyển'), { status: 404 });
    const updated = await prisma.application.update({
      where: { id: appId },
      data: { status, ...(note !== undefined ? { note } : {}) },
    });

    prisma.applicationStatusHistory.create({
      data: {
        applicationId: appId,
        fromStatus: application.status,
        toStatus: status,
        changedById: job.employer.userId,
        note: note,
      },
    }).catch(console.error);

    sendApplicationStatusEmail(application.candidate.user.email, job.title, status, note).catch(console.error);

    createNotification({
      userId: application.candidate.userId,
      type: NotificationType.APPLICATION_STATUS_CHANGED,
      title: 'Cập nhật đơn ứng tuyển',
      message: `Đơn ứng tuyển vị trí "${job.title}" đã chuyển sang trạng thái ${status}`,
      link: '/candidate/applications',
    }).catch(console.error);

    return updated;
  },

  async updateApplicationTag(userId: string, jobId: string, appId: string, tag: ApplicationTag | null) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    const application = await prisma.application.findFirst({ where: { id: appId, jobId } });
    if (!application) throw Object.assign(new Error('Không tìm thấy đơn ứng tuyển'), { status: 404 });
    return prisma.application.update({ where: { id: appId }, data: { tag } });
  },

  async getTemplates(userId: string) {
    const employer = await prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw Object.assign(new Error('Không tìm thấy hồ sơ công ty'), { status: 404 });
    return prisma.jobTemplate.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createTemplate(userId: string, data: Record<string, unknown>) {
    const employer = await prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw Object.assign(new Error('Không tìm thấy hồ sơ công ty'), { status: 404 });
    return prisma.jobTemplate.create({
      data: {
        ...data,
        employerId: employer.id,
      } as Parameters<typeof prisma.jobTemplate.create>[0]['data'],
    });
  },

  async deleteTemplate(userId: string, templateId: string) {
    const employer = await prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw Object.assign(new Error('Không tìm thấy hồ sơ công ty'), { status: 404 });
    const template = await prisma.jobTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw Object.assign(new Error('Không tìm thấy template'), { status: 404 });
    if (template.employerId !== employer.id) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    await prisma.jobTemplate.delete({ where: { id: templateId } });
  },

  async exportApplicationsCsv(userId: string, jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });

    const applications = await prisma.application.findMany({
      where: { jobId },
      orderBy: { appliedAt: 'asc' },
      include: { candidate: { include: { user: { select: { email: true } } } } },
    });

    const statusLabel: Record<string, string> = {
      PENDING: 'Chờ xét duyệt',
      REVIEWING: 'Đang xem xét',
      ACCEPTED: 'Chấp nhận',
      REJECTED: 'Từ chối',
    };
    const tagLabel: Record<string, string> = {
      SHORTLISTED: 'Tiềm năng cao',
      POTENTIAL: 'Tiềm năng',
      ON_HOLD: 'Tạm giữ',
    };

    const esc = (v: string | null | undefined) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const header = 'STT,Họ tên,Email,Tiêu đề,Trạng thái,Tag,Ghi chú,Ngày nộp đơn,Link CV';
    const rows = applications.map((app, i) => [
      i + 1,
      esc(app.candidate.fullName),
      esc(app.candidate.user.email),
      esc(app.candidate.headline),
      esc(statusLabel[app.status] ?? app.status),
      esc(app.tag ? tagLabel[app.tag] ?? app.tag : ''),
      esc(app.note),
      new Date(app.appliedAt).toLocaleDateString('vi-VN'),
      esc(app.cvUrl),
    ].join(','));

    return { csv: [header, ...rows].join('\r\n'), jobTitle: job.title };
  },

  async searchCandidates(params: {
    skill?: string;
    location?: string;
    headline?: string;
    page: number;
    limit: number;
  }) {
    const { skill, location, headline, page, limit } = params;
    const skip = (page - 1) * limit;

    if (skill) {
      const likeSkill = skill.toLowerCase();
      const whereLocation = location ? `AND LOWER(c.location) LIKE LOWER('%' || $2 || '%')` : '';
      const whereHeadline = headline ? `AND LOWER(c.headline) LIKE LOWER('%' || $3 || '%')` : '' ;

      const extraArgs: string[] = [];
      if (location) extraArgs.push(location);
      if (headline) extraArgs.push(headline);

      const countRaw = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*) as count FROM "Candidate" c
         WHERE EXISTS (SELECT 1 FROM unnest(c.skills) s WHERE LOWER(s) = $1)
         ${whereLocation} ${whereHeadline}`,
        likeSkill,
        ...extraArgs,
      );
      const total = Number(countRaw[0]?.count ?? 0);

      const candidates = await prisma.$queryRawUnsafe<{
        id: string;
        fullName: string;
        avatarUrl: string | null;
        headline: string | null;
        location: string | null;
        skills: string[];
        experienceCount: number;
      }[]>(
        `SELECT c.id, c."fullName", c."avatarUrl", c.headline, c.location, c.skills,
                (SELECT COUNT(*) FROM "Experience" e WHERE e."candidateId" = c.id)::int as "experienceCount"
         FROM "Candidate" c
         WHERE EXISTS (SELECT 1 FROM unnest(c.skills) s WHERE LOWER(s) = $1)
         ${whereLocation} ${whereHeadline}
         ORDER BY c.id DESC
         LIMIT $${extraArgs.length + 2} OFFSET $${extraArgs.length + 3}`,
        likeSkill,
        ...extraArgs,
        limit,
        skip,
      );

      return { candidates, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    const where: { location?: { contains: string; mode: 'insensitive' }; headline?: { contains: string; mode: 'insensitive' } } = {};
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (headline) where.headline = { contains: headline, mode: 'insensitive' };

    const [raw, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          headline: true,
          location: true,
          skills: true,
          _count: { select: { experiences: true } },
        },
      }),
      prisma.candidate.count({ where }),
    ]);

    const candidates = raw.map(c => ({
      id: c.id,
      fullName: c.fullName,
      avatarUrl: c.avatarUrl,
      headline: c.headline,
      location: c.location,
      skills: c.skills,
      experienceCount: c._count.experiences,
    }));

    return { candidates, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getJobStats(userId: string) {
    const employer = await prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw Object.assign(new Error('Không tìm thấy hồ sơ công ty'), { status: 404 });

    const jobs = await prisma.job.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        status: true,
        viewCount: true,
        createdAt: true,
        _count: { select: { applications: true } },
      },
    });

    const jobIds = jobs.map(j => j.id);
    const acceptedCounts = await prisma.application.groupBy({
      by: ['jobId'],
      where: { jobId: { in: jobIds }, status: ApplicationStatus.ACCEPTED },
      _count: { id: true },
    });
    const acceptedMap: Record<string, number> = Object.fromEntries(
      acceptedCounts.map(a => [a.jobId, a._count.id])
    );

    const jobStats = jobs.map(job => ({
      id: job.id,
      title: job.title,
      status: job.status,
      viewCount: job.viewCount,
      applicationCount: job._count.applications,
      acceptedCount: acceptedMap[job.id] ?? 0,
      conversionRate: job.viewCount > 0 ? Math.round((job._count.applications / job.viewCount) * 100) : 0,
      createdAt: job.createdAt,
    }));

    const [totalJobs, activeJobs, viewsAgg, totalApplications] = await Promise.all([
      prisma.job.count({ where: { employerId: employer.id } }),
      prisma.job.count({ where: { employerId: employer.id, status: 'ACTIVE' } }),
      prisma.job.aggregate({ where: { employerId: employer.id }, _sum: { viewCount: true } }),
      prisma.application.count({ where: { job: { employerId: employer.id } } }),
    ]);
    const totalViews = viewsAgg._sum.viewCount ?? 0;

    return {
      jobs: jobStats,
      summary: {
        totalJobs,
        activeJobs,
        totalViews,
        totalApplications,
        avgConversionRate: totalViews > 0 ? Math.round((totalApplications / totalViews) * 100) : 0,
      },
    };
  },

  async getSalaryBenchmark({ title, industry }: { title?: string; industry?: string }) {
    const where: any = {
      status: 'ACTIVE',
      salaryMin: { not: null },
      salaryMax: { not: null },
    };
    if (industry) where.industry = industry;
    if (title && title.trim().length >= 3) {
      const tokens = title.split(/\s+/).filter((w) => w.length >= 4);
      if (tokens.length > 0) {
        where.OR = tokens.map((t) => ({ title: { contains: t, mode: 'insensitive' } }));
      } else {
        where.title = { contains: title.trim(), mode: 'insensitive' };
      }
    }
    const jobs = await prisma.job.findMany({ where, select: { salaryMin: true, salaryMax: true } });
    const mids = jobs
      .map((j) => ((j.salaryMin ?? 0) + (j.salaryMax ?? 0)) / 2)
      .filter((v) => v > 0)
      .sort((a, b) => a - b);
    const count = mids.length;
    if (count < 3) return { count, enough: false as const, currency: 'VND' };
    const percentile = (arr: number[], p: number) => {
      const idx = (arr.length - 1) * p;
      const lo = Math.floor(idx);
      const hi = Math.ceil(idx);
      if (lo === hi) return arr[lo];
      return arr[lo] + (arr[hi] - arr[lo]) * (idx - lo);
    };
    const sum = mids.reduce((a, b) => a + b, 0);
    return {
      count,
      enough: true as const,
      currency: 'VND',
      min: Math.round(mids[0]),
      max: Math.round(mids[count - 1]),
      avg: Math.round(sum / count),
      p25: Math.round(percentile(mids, 0.25)),
      p50: Math.round(percentile(mids, 0.5)),
      p75: Math.round(percentile(mids, 0.75)),
    };
  },

  async getApplicationNotes(userId: string, jobId: string, appId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    const app = await prisma.application.findFirst({ where: { id: appId, jobId } });
    if (!app) throw Object.assign(new Error('Không tìm thấy đơn ứng tuyển'), { status: 404 });
    return prisma.applicationNote.findMany({
      where: { applicationId: appId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, content: true, createdAt: true },
    });
  },

  async createApplicationNote(userId: string, jobId: string, appId: string, content: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    const app = await prisma.application.findFirst({ where: { id: appId, jobId } });
    if (!app) throw Object.assign(new Error('Không tìm thấy đơn ứng tuyển'), { status: 404 });
    return prisma.applicationNote.create({
      data: { applicationId: appId, authorId: userId, content },
      select: { id: true, content: true, createdAt: true },
    });
  },

  async getPublicCompany(employerId: string) {
    const employer = await prisma.employer.findUnique({
      where: { id: employerId },
      select: {
        id: true,
        companyName: true,
        logoUrl: true,
        website: true,
        industry: true,
        companySize: true,
        description: true,
        location: true,
        isVerified: true,
        _count: { select: { jobs: { where: { status: JobStatus.ACTIVE } } } },
      },
    });
    if (!employer) throw Object.assign(new Error('Không tìm thấy công ty'), { status: 404 });
    return employer;
  },

  async getScreeningQuestions(userId: string, jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    return prisma.screeningQuestion.findMany({
      where: { jobId },
      orderBy: { order: 'asc' },
      select: { id: true, question: true, type: true, isRequired: true, order: true },
    });
  },

  async createScreeningQuestion(userId: string, jobId: string, data: { question: string; type: string; isRequired: boolean }) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    const count = await prisma.screeningQuestion.count({ where: { jobId } });
    if (count >= 5) throw Object.assign(new Error('Tối đa 5 câu hỏi mỗi tin tuyển dụng'), { status: 400 });
    const { QuestionType } = await import('../generated/prisma/client');
    const type = Object.values(QuestionType).includes(data.type as never) ? data.type as import('../generated/prisma/client').QuestionType : QuestionType.TEXT;
    return prisma.screeningQuestion.create({
      data: { jobId, question: data.question, type, isRequired: data.isRequired, order: count },
    });
  },

  async deleteScreeningQuestion(userId: string, jobId: string, questionId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    const q = await prisma.screeningQuestion.findUnique({ where: { id: questionId } });
    if (!q || q.jobId !== jobId) throw Object.assign(new Error('Không tìm thấy câu hỏi'), { status: 404 });
    await prisma.screeningQuestion.delete({ where: { id: questionId } });
  },

  async createInterview(userId: string, jobId: string, appId: string, data: { scheduledAt: string; location?: string; meetingLink?: string; note?: string }) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: { include: { user: true } } } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    const app = await prisma.application.findFirst({
      where: { id: appId, jobId },
      include: { candidate: { include: { user: true } } },
    });
    if (!app) throw Object.assign(new Error('Không tìm thấy đơn ứng tuyển'), { status: 404 });

    const interview = await prisma.interviewSchedule.create({
      data: {
        applicationId: appId,
        scheduledAt: new Date(data.scheduledAt),
        location: data.location,
        meetingLink: data.meetingLink,
        note: data.note,
      },
    });

    // Email + in-app notification for candidate
    void sendInterviewInviteEmail(
      app.candidate.user.email,
      app.candidate.fullName,
      job.employer.companyName,
      job.title,
      interview.scheduledAt,
      interview.location ?? undefined,
      interview.meetingLink ?? undefined,
    ).catch(() => {});

    void createNotification({
      userId: app.candidate.userId,
      type: NotificationType.INTERVIEW_SCHEDULED,
      title: 'Lịch phỏng vấn mới',
      message: `${job.employer.companyName} mời bạn phỏng vấn vị trí ${job.title}`,
      link: '/candidate/applications',
    }).catch(() => {});

    return interview;
  },

  async updateInterview(userId: string, jobId: string, appId: string, interviewId: string, data: { scheduledAt?: string; location?: string; meetingLink?: string; note?: string }) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: { include: { user: true } } } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    const app = await prisma.application.findFirst({
      where: { id: appId, jobId },
      include: { candidate: { include: { user: true } } },
    });
    if (!app) throw Object.assign(new Error('Không tìm thấy đơn ứng tuyển'), { status: 404 });
    const existing = await prisma.interviewSchedule.findFirst({ where: { id: interviewId, applicationId: appId } });
    if (!existing) throw Object.assign(new Error('Không tìm thấy lịch phỏng vấn'), { status: 404 });

    const updated = await prisma.interviewSchedule.update({
      where: { id: interviewId },
      data: {
        ...(data.scheduledAt ? { scheduledAt: new Date(data.scheduledAt) } : {}),
        ...(data.location !== undefined ? { location: data.location } : {}),
        ...(data.meetingLink !== undefined ? { meetingLink: data.meetingLink } : {}),
        ...(data.note !== undefined ? { note: data.note } : {}),
        status: InterviewStatus.PENDING,
      },
    });

    // Resend invite if time changed
    if (data.scheduledAt) {
      void sendInterviewInviteEmail(
        app.candidate.user.email,
        app.candidate.fullName,
        job.employer.companyName,
        job.title,
        updated.scheduledAt,
        updated.location ?? undefined,
        updated.meetingLink ?? undefined,
      ).catch(() => {});
    }

    return updated;
  },

  async deleteInterview(userId: string, jobId: string, appId: string, interviewId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    const existing = await prisma.interviewSchedule.findFirst({ where: { id: interviewId, applicationId: appId } });
    if (!existing) throw Object.assign(new Error('Không tìm thấy lịch phỏng vấn'), { status: 404 });
    await prisma.interviewSchedule.delete({ where: { id: interviewId } });
  },

  async getInterviewsForApp(userId: string, jobId: string, appId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    return prisma.interviewSchedule.findMany({
      where: { applicationId: appId },
      orderBy: { scheduledAt: 'asc' },
    });
  },

  async getPublicList(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { isVerified: false };
    const [employers, total] = await Promise.all([
      prisma.employer.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
          industry: true,
          location: true,
          companySize: true,
          _count: { select: { jobs: { where: { status: JobStatus.ACTIVE } } } },
        },
      }),
      prisma.employer.count(),
    ]);
    void where;
    return { employers, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getRecentApplications(userId: string, opts: { status?: ApplicationStatus; limit: number }) {
    const employer = await prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw Object.assign(new Error('Không tìm thấy hồ sơ công ty'), { status: 404 });
    const applications = await prisma.application.findMany({
      where: {
        job: { employerId: employer.id },
        ...(opts.status ? { status: opts.status } : {}),
      },
      orderBy: { appliedAt: 'desc' },
      take: opts.limit,
      select: {
        id: true,
        status: true,
        appliedAt: true,
        job: { select: { id: true, title: true } },
        candidate: { select: { fullName: true, avatarUrl: true, headline: true } },
      },
    });
    return applications;
  },

  async getAllApplications(
    userId: string,
    opts: { jobId?: string; status?: string; tag?: string; keyword?: string; page: number; limit: number },
  ) {
    const employer = await prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw Object.assign(new Error('Không tìm thấy hồ sơ công ty'), { status: 404 });

    const where: Record<string, unknown> = { job: { employerId: employer.id } };
    if (opts.jobId) (where.job as Record<string, unknown>) = { employerId: employer.id, id: opts.jobId };
    if (opts.status && Object.values(ApplicationStatus).includes(opts.status as ApplicationStatus)) {
      where.status = opts.status as ApplicationStatus;
    }
    if (opts.tag === 'NONE') {
      where.tag = null;
    } else if (opts.tag && Object.values(ApplicationTag).includes(opts.tag as ApplicationTag)) {
      where.tag = opts.tag as ApplicationTag;
    }
    if (opts.keyword && opts.keyword.length >= 2) {
      where.candidate = {
        OR: [
          { fullName: { contains: opts.keyword, mode: 'insensitive' } },
          { user: { email: { contains: opts.keyword, mode: 'insensitive' } } },
        ],
      };
    }

    const skip = (opts.page - 1) * opts.limit;
    const [applications, total, jobOptions, summary] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: opts.limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          candidate: { include: { user: { select: { email: true } } } },
          job: { select: { id: true, title: true } },
          screeningAnswers: {
            select: { id: true, answer: true, question: { select: { question: true, type: true } } },
          },
          interviews: { orderBy: { scheduledAt: 'desc' }, take: 1 },
        },
      }),
      prisma.application.count({ where }),
      prisma.job.findMany({
        where: { employerId: employer.id },
        select: { id: true, title: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.application.groupBy({
        by: ['status'],
        where: { job: { employerId: employer.id } },
        _count: { _all: true },
      }),
    ]);

    const counts = { total: 0, PENDING: 0, REVIEWING: 0, ACCEPTED: 0, REJECTED: 0 } as Record<string, number>;
    for (const row of summary) {
      counts[row.status] = row._count._all;
      counts.total += row._count._all;
    }

    return {
      applications,
      total,
      page: opts.page,
      limit: opts.limit,
      totalPages: Math.ceil(total / opts.limit),
      jobOptions,
      summary: counts,
    };
  },
};
