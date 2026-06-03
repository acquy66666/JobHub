import { prisma } from '../lib/prisma';
import { uploadToCloudinary } from '../lib/cloudinary';
import { sendApplicationStatusEmail } from '../utils/email';
import { createNotification } from './notification.service';
import { JobStatus, ApplicationStatus, ApplicationTag, NotificationType } from '../generated/prisma/client';

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

    return prisma.job.create({
      data: {
        ...data,
        expiresAt: new Date(data.expiresAt as string),
        employerId: employer.id,
        status: JobStatus.PENDING,
        isFlagged,
        ...(flagReason && { flagReason }),
      } as Parameters<typeof prisma.job.create>[0]['data'],
    });
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
    return prisma.job.update({ where: { id: jobId }, data: updateData as Parameters<typeof prisma.job.update>[0]['data'] });
  },

  async deleteJob(userId: string, jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    await prisma.job.delete({ where: { id: jobId } });
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
    return prisma.job.update({ where: { id: jobId }, data: { status: newStatus } });
  },

  async getJobApplications(userId: string, jobId: string, page: number, limit: number) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.employer.userId !== userId) throw Object.assign(new Error('Không có quyền truy cập'), { status: 403 });
    const skip = (page - 1) * limit;
    const where = { jobId };
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

    sendApplicationStatusEmail(application.candidate.user.email, job.title, status).catch(console.error);

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
};
