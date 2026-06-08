import { prisma } from '../lib/prisma';
import { uploadToCloudinary } from '../lib/cloudinary';
import { sendApplicationEmail } from '../utils/email';
import { JobStatus, NotificationType, InterviewStatus } from '../generated/prisma/client';
import { createNotification } from './notification.service';

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export const candidateService = {
  async getProfile(userId: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startYear: 'desc' } },
        user: { select: { email: true } },
      },
    });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });

    // Lazy-init publicSlug nếu chưa có
    if (!candidate.publicSlug) {
      const slug = generateSlug(candidate.fullName);
      try {
        await prisma.candidate.update({ where: { userId }, data: { publicSlug: slug } });
        return { ...candidate, publicSlug: slug };
      } catch {
        // slug trùng (race condition) — bỏ qua, trả về không có slug
      }
    }

    return candidate;
  },

  async updateProfile(userId: string, data: Record<string, unknown>, avatarBuffer?: Buffer) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });

    if (Array.isArray(data.skills)) {
      const slugs = (data.skills as string[]).filter((s) => typeof s === 'string' && s.length > 0);
      if (slugs.length > 0) {
        const found = await prisma.skill.findMany({ where: { slug: { in: slugs } }, select: { slug: true } });
        const validSet = new Set(found.map((s) => s.slug));
        const invalid = slugs.filter((s) => !validSet.has(s));
        if (invalid.length > 0) {
          throw Object.assign(new Error(`Kỹ năng không hợp lệ: ${invalid.join(', ')}`), { status: 422, code: 'INVALID_SKILLS', invalidSkills: invalid });
        }
      }
      data.skills = slugs;
    }

    if (Array.isArray(data.legacySkills)) {
      data.legacySkills = (data.legacySkills as string[]).filter((s) => typeof s === 'string' && s.length > 0);
    }

    let avatarUrl = candidate.avatarUrl;
    if (avatarBuffer) {
      avatarUrl = await uploadToCloudinary(avatarBuffer, 'candidate-avatars', 'image');
    }
    return prisma.candidate.update({
      where: { userId },
      data: { ...data, avatarUrl } as Parameters<typeof prisma.candidate.update>[0]['data'],
    });
  },

  async uploadCv(userId: string, pdfBuffer: Buffer, originalName: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const cvUrl = await uploadToCloudinary(pdfBuffer, 'candidate-cvs', 'raw');
    return prisma.candidate.update({
      where: { userId },
      data: { cvUrl, cvFileName: originalName },
    });
  },

  async addExperience(userId: string, data: Record<string, unknown>) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    return prisma.experience.create({
      data: {
        ...data,
        startDate: new Date(data.startDate as string),
        endDate: data.endDate ? new Date(data.endDate as string) : null,
        candidateId: candidate.id,
      } as Parameters<typeof prisma.experience.create>[0]['data'],
    });
  },

  async updateExperience(userId: string, experienceId: string, data: Record<string, unknown>) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const exp = await prisma.experience.findFirst({ where: { id: experienceId, candidateId: candidate.id } });
    if (!exp) throw Object.assign(new Error('Không tìm thấy kinh nghiệm'), { status: 404 });
    const updateData: Record<string, unknown> = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate as string);
    if (data.endDate) updateData.endDate = new Date(data.endDate as string);
    if (data.endDate === null) updateData.endDate = null;
    return prisma.experience.update({
      where: { id: experienceId },
      data: updateData as Parameters<typeof prisma.experience.update>[0]['data'],
    });
  },

  async deleteExperience(userId: string, experienceId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const exp = await prisma.experience.findFirst({ where: { id: experienceId, candidateId: candidate.id } });
    if (!exp) throw Object.assign(new Error('Không tìm thấy kinh nghiệm'), { status: 404 });
    await prisma.experience.delete({ where: { id: experienceId } });
  },

  async addEducation(userId: string, data: Record<string, unknown>) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    return prisma.education.create({
      data: { ...data, candidateId: candidate.id } as Parameters<typeof prisma.education.create>[0]['data'],
    });
  },

  async updateEducation(userId: string, educationId: string, data: Record<string, unknown>) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const edu = await prisma.education.findFirst({ where: { id: educationId, candidateId: candidate.id } });
    if (!edu) throw Object.assign(new Error('Không tìm thấy học vấn'), { status: 404 });
    return prisma.education.update({
      where: { id: educationId },
      data: data as Parameters<typeof prisma.education.update>[0]['data'],
    });
  },

  async deleteEducation(userId: string, educationId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const edu = await prisma.education.findFirst({ where: { id: educationId, candidateId: candidate.id } });
    if (!edu) throw Object.assign(new Error('Không tìm thấy học vấn'), { status: 404 });
    await prisma.education.delete({ where: { id: educationId } });
  },

  async applyJob(userId: string, jobId: string, cvUrl: string, coverLetter?: string, screeningAnswers?: { questionId: string; answer: string }[]) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { employer: { include: { user: { select: { email: true } } } } },
    });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    if (job.status !== JobStatus.ACTIVE || job.expiresAt < new Date())
      throw Object.assign(new Error('Tin tuyển dụng không còn nhận đơn'), { status: 400 });

    const existing = await prisma.application.findUnique({
      where: { jobId_candidateId: { jobId, candidateId: candidate.id } },
    });
    if (existing) throw Object.assign(new Error('Bạn đã ứng tuyển vị trí này rồi'), { status: 409 });

    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: { jobId, candidateId: candidate.id, cvUrl, coverLetter },
      });
      if (screeningAnswers && screeningAnswers.length > 0) {
        await tx.screeningAnswer.createMany({
          data: screeningAnswers.map(({ questionId, answer }) => ({
            questionId,
            applicationId: app.id,
            answer,
          })),
          skipDuplicates: true,
        });
      }
      return app;
    });

    sendApplicationEmail(job.employer.user.email, job.title, candidate.fullName).catch(console.error);

    createNotification({
      userId: job.employer.userId,
      type: NotificationType.NEW_APPLICATION,
      title: 'Đơn ứng tuyển mới',
      message: `${candidate.fullName} vừa ứng tuyển vị trí "${job.title}"`,
      link: `/employer/jobs/${jobId}/applications`,
    }).catch(console.error);

    return application;
  },

  async getMyApplications(userId: string, page: number, limit: number) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const skip = (page - 1) * limit;
    const where = { candidateId: candidate.id };
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          job: {
            include: {
              employer: { select: { id: true, companyName: true, logoUrl: true, location: true } },
            },
          },
          interviews: {
            orderBy: { scheduledAt: 'desc' },
            take: 1,
            select: { id: true, scheduledAt: true, status: true, location: true, meetingLink: true },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);
    return { applications, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async saveJob(userId: string, jobId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const existing = await prisma.savedJob.findUnique({
      where: { jobId_candidateId: { jobId, candidateId: candidate.id } },
    });
    if (existing) throw Object.assign(new Error('Đã lưu việc làm này rồi'), { status: 409 });
    return prisma.savedJob.create({ data: { jobId, candidateId: candidate.id } });
  },

  async unsaveJob(userId: string, jobId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    await prisma.savedJob.deleteMany({ where: { jobId, candidateId: candidate.id } });
  },

  async getSavedJobs(userId: string, page: number, limit: number) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const skip = (page - 1) * limit;
    const where = { candidateId: candidate.id };
    const [savedJobs, total] = await Promise.all([
      prisma.savedJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { savedAt: 'desc' },
        include: {
          job: {
            include: {
              employer: { select: { id: true, companyName: true, logoUrl: true, location: true, industry: true } },
            },
          },
        },
      }),
      prisma.savedJob.count({ where }),
    ]);
    return { savedJobs, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getJobGap(userId: string, jobId: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      include: {
        certificates: {
          where: { status: 'APPROVED' },
          select: { certificateSlug: true },
        },
      },
    });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });

    const saved = await prisma.savedJob.findUnique({
      where: { jobId_candidateId: { jobId, candidateId: candidate.id } },
    });
    if (!saved) throw Object.assign(new Error('Việc làm này chưa được lưu'), { status: 404 });

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        skillSlugs: true,
        experienceYearsMin: true,
        experienceTier: true,
        requiredCertificateSlugs: true,
      },
    });
    if (!job) throw Object.assign(new Error('Không tìm thấy việc làm'), { status: 404 });

    const candSkills = new Set(candidate.skills);
    const reqSkills: string[] = job.skillSlugs ?? [];
    const haveSkills = reqSkills.filter((s) => candSkills.has(s));
    const missingSkills = reqSkills.filter((s) => !candSkills.has(s));

    const required = job.experienceYearsMin ?? null;
    const have = candidate.totalYearsExperience ?? null;
    const met = required === null ? true : (have ?? 0) >= required;
    const shortBy = required === null || met ? 0 : required - (have ?? 0);

    const candCertSlugs = new Set(candidate.certificates.map((c) => c.certificateSlug));
    const reqCerts: string[] = job.requiredCertificateSlugs ?? [];
    const haveCerts = reqCerts.filter((s) => candCertSlugs.has(s));
    const missingCerts = reqCerts.filter((s) => !candCertSlugs.has(s));

    const certMeta = reqCerts.length
      ? await prisma.certificate.findMany({
          where: { slug: { in: reqCerts } },
          select: { slug: true, nameVi: true, nameEn: true, issuer: true },
        })
      : [];

    return {
      jobId: job.id,
      jobTitle: job.title,
      skills: { required: reqSkills, have: haveSkills, missing: missingSkills },
      experience: { required, have, met, shortBy, tier: job.experienceTier },
      certificates: {
        required: reqCerts,
        have: haveCerts,
        missing: missingCerts,
        meta: certMeta,
      },
    };
  },

  async getJobAlerts(userId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    return prisma.jobAlert.findMany({
      where: { candidateId: candidate.id },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createJobAlert(userId: string, data: {
    industries: string[];
    locations: string[];
    jobTypes: string[];
    frequency: 'DAILY' | 'WEEKLY';
  }) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    return prisma.jobAlert.create({
      data: {
        id: crypto.randomUUID(),
        candidateId: candidate.id,
        industries: data.industries,
        locations: data.locations,
        jobTypes: data.jobTypes as import('../generated/prisma/client').JobType[],
        frequency: data.frequency,
      },
    });
  },

  async updateJobAlert(userId: string, alertId: string, data: {
    industries?: string[];
    locations?: string[];
    jobTypes?: string[];
    frequency?: 'DAILY' | 'WEEKLY';
    isActive?: boolean;
  }) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const alert = await prisma.jobAlert.findFirst({ where: { id: alertId, candidateId: candidate.id } });
    if (!alert) throw Object.assign(new Error('Không tìm thấy thông báo'), { status: 404 });
    return prisma.jobAlert.update({
      where: { id: alertId },
      data: {
        ...(data.industries !== undefined && { industries: data.industries }),
        ...(data.locations !== undefined && { locations: data.locations }),
        ...(data.jobTypes !== undefined && { jobTypes: data.jobTypes as import('../generated/prisma/client').JobType[] }),
        ...(data.frequency !== undefined && { frequency: data.frequency }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  },

  async deleteJobAlert(userId: string, alertId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const alert = await prisma.jobAlert.findFirst({ where: { id: alertId, candidateId: candidate.id } });
    if (!alert) throw Object.assign(new Error('Không tìm thấy thông báo'), { status: 404 });
    await prisma.jobAlert.delete({ where: { id: alertId } });
  },

  async followCompany(userId: string, employerId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const employer = await prisma.employer.findUnique({ where: { id: employerId } });
    if (!employer) throw Object.assign(new Error('Không tìm thấy công ty'), { status: 404 });
    try {
      return await prisma.followedCompany.create({
        data: { candidateId: candidate.id, employerId },
      });
    } catch {
      throw Object.assign(new Error('Bạn đã theo dõi công ty này'), { status: 409 });
    }
  },

  async unfollowCompany(userId: string, employerId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const follow = await prisma.followedCompany.findUnique({
      where: { candidateId_employerId: { candidateId: candidate.id, employerId } },
    });
    if (!follow) throw Object.assign(new Error('Bạn chưa theo dõi công ty này'), { status: 404 });
    await prisma.followedCompany.delete({ where: { id: follow.id } });
  },

  async getFollowedCompanies(userId: string, page: number, limit: number) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.followedCompany.findMany({
        where: { candidateId: candidate.id },
        skip,
        take: limit,
        orderBy: { followedAt: 'desc' },
        include: {
          employer: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              industry: true,
              location: true,
              isVerified: true,
              _count: { select: { jobs: true } },
            },
          },
        },
      }),
      prisma.followedCompany.count({ where: { candidateId: candidate.id } }),
    ]);
    return { companies: items.map(i => ({ ...i.employer, followedAt: i.followedAt })), total, totalPages: Math.ceil(total / limit) };
  },

  async isFollowing(userId: string, employerId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) return false;
    const follow = await prisma.followedCompany.findUnique({
      where: { candidateId_employerId: { candidateId: candidate.id, employerId } },
    });
    return !!follow;
  },

  async getApplicationTimeline(userId: string, appId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const application = await prisma.application.findFirst({
      where: { id: appId, candidateId: candidate.id },
      include: {
        job: { select: { title: true, employer: { select: { companyName: true } } } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!application) throw Object.assign(new Error('Không tìm thấy đơn ứng tuyển'), { status: 404 });
    return application;
  },

  async getCvs(userId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });

    let cvs = await prisma.candidateCV.findMany({
      where: { candidateId: candidate.id },
      orderBy: { createdAt: 'desc' },
    });

    // Backfill: nếu chưa có CandidateCV row nào nhưng candidate có cvUrl cũ
    if (cvs.length === 0 && candidate.cvUrl) {
      const created = await prisma.candidateCV.create({
        data: {
          candidateId: candidate.id,
          fileName: candidate.cvFileName ?? 'cv.pdf',
          fileUrl: candidate.cvUrl,
          isDefault: true,
        },
      });
      cvs = [created];
    }

    return cvs;
  },

  async uploadCvFile(userId: string, pdfBuffer: Buffer, originalName: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });

    const fileUrl = await uploadToCloudinary(pdfBuffer, 'candidate-cvs', 'raw');

    const existingCount = await prisma.candidateCV.count({ where: { candidateId: candidate.id } });
    const isFirst = existingCount === 0;

    const cv = await prisma.candidateCV.create({
      data: {
        candidateId: candidate.id,
        fileName: originalName,
        fileUrl,
        isDefault: isFirst,
      },
    });

    // Cập nhật cvUrl trên Candidate để backward compat (ApplyModal cũ, profile completeness)
    if (isFirst) {
      await prisma.candidate.update({
        where: { userId },
        data: { cvUrl: fileUrl, cvFileName: originalName },
      });
    }

    return cv;
  },

  async setDefaultCv(userId: string, cvId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });

    const cv = await prisma.candidateCV.findFirst({ where: { id: cvId, candidateId: candidate.id } });
    if (!cv) throw Object.assign(new Error('Không tìm thấy CV'), { status: 404 });

    await prisma.$transaction([
      prisma.candidateCV.updateMany({
        where: { candidateId: candidate.id },
        data: { isDefault: false },
      }),
      prisma.candidateCV.update({
        where: { id: cvId },
        data: { isDefault: true },
      }),
      prisma.candidate.update({
        where: { userId },
        data: { cvUrl: cv.fileUrl, cvFileName: cv.fileName },
      }),
    ]);

    return { success: true };
  },

  async updatePublicSettings(userId: string, data: { isPublicProfile?: boolean; publicSlug?: string }) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });

    const updateData: { isPublicProfile?: boolean; publicSlug?: string } = {};

    if (data.isPublicProfile !== undefined) updateData.isPublicProfile = data.isPublicProfile;

    if (data.publicSlug !== undefined) {
      const slug = data.publicSlug.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 50);
      if (slug.length < 3) throw Object.assign(new Error('Slug phải có ít nhất 3 ký tự'), { status: 400 });
      // Check unique (loại trừ chính mình)
      const conflict = await prisma.candidate.findUnique({ where: { publicSlug: slug } });
      if (conflict && conflict.id !== candidate.id) {
        throw Object.assign(new Error('Slug này đã được sử dụng, hãy chọn slug khác'), { status: 409 });
      }
      updateData.publicSlug = slug;
    }

    // Nếu bật public nhưng chưa có slug → tự sinh
    const needsSlug = updateData.isPublicProfile === true && !candidate.publicSlug && !updateData.publicSlug;
    if (needsSlug) {
      updateData.publicSlug = generateSlug(candidate.fullName);
    }

    return prisma.candidate.update({ where: { userId }, data: updateData });
  },

  async getPublicProfile(slug: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { publicSlug: slug },
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startYear: 'desc' } },
        certificates: {
          where: { status: 'APPROVED' },
          include: { certificate: { select: { slug: true, nameVi: true, nameEn: true, issuer: true, category: true, level: true } } },
          orderBy: { issuedDate: 'desc' },
        },
      },
    });
    if (!candidate || !candidate.isPublicProfile) {
      throw Object.assign(new Error('Hồ sơ không tồn tại hoặc chưa được công khai'), { status: 404 });
    }
    const { id, fullName, avatarUrl, headline, summary, location, skills, experiences, educations, certificates } = candidate;
    return { id, fullName, avatarUrl, headline, summary, location, skills, experiences, educations, certificates };
  },

  async deleteCv(userId: string, cvId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });

    const cv = await prisma.candidateCV.findFirst({ where: { id: cvId, candidateId: candidate.id } });
    if (!cv) throw Object.assign(new Error('Không tìm thấy CV'), { status: 404 });

    const total = await prisma.candidateCV.count({ where: { candidateId: candidate.id } });
    if (total <= 1) throw Object.assign(new Error('Không thể xóa CV duy nhất'), { status: 400 });

    await prisma.candidateCV.delete({ where: { id: cvId } });

    // Nếu xóa CV mặc định, đặt CV mới nhất làm mặc định
    if (cv.isDefault) {
      const next = await prisma.candidateCV.findFirst({
        where: { candidateId: candidate.id },
        orderBy: { createdAt: 'desc' },
      });
      if (next) {
        await prisma.candidateCV.update({ where: { id: next.id }, data: { isDefault: true } });
        await prisma.candidate.update({
          where: { userId },
          data: { cvUrl: next.fileUrl, cvFileName: next.fileName },
        });
      }
    }

    return { success: true };
  },

  async getInterviews(userId: string, appId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const app = await prisma.application.findFirst({ where: { id: appId, candidateId: candidate.id } });
    if (!app) throw Object.assign(new Error('Không tìm thấy đơn ứng tuyển'), { status: 404 });
    return prisma.interviewSchedule.findMany({
      where: { applicationId: appId },
      orderBy: { scheduledAt: 'asc' },
    });
  },

  async respondInterview(userId: string, appId: string, interviewId: string, action: 'confirm' | 'cancel') {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
    const app = await prisma.application.findFirst({
      where: { id: appId, candidateId: candidate.id },
      include: { job: { include: { employer: { include: { user: true } } } } },
    });
    if (!app) throw Object.assign(new Error('Không tìm thấy đơn ứng tuyển'), { status: 404 });
    const interview = await prisma.interviewSchedule.findFirst({ where: { id: interviewId, applicationId: appId } });
    if (!interview) throw Object.assign(new Error('Không tìm thấy lịch phỏng vấn'), { status: 404 });

    const newStatus = action === 'confirm' ? InterviewStatus.CONFIRMED : InterviewStatus.CANCELLED;
    const updated = await prisma.interviewSchedule.update({ where: { id: interviewId }, data: { status: newStatus } });

    // Notify employer
    void createNotification({
      userId: app.job.employer.userId,
      type: NotificationType.SYSTEM,
      title: action === 'confirm' ? 'Ứng viên xác nhận lịch phỏng vấn' : 'Ứng viên từ chối lịch phỏng vấn',
      message: `${candidate.fullName} đã ${action === 'confirm' ? 'xác nhận' : 'từ chối'} lịch phỏng vấn vị trí ${app.job.title}`,
      link: `/employer/jobs/${app.jobId}/applications`,
    }).catch(() => {});

    return updated;
  },
};
