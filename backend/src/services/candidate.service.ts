import { prisma } from '../lib/prisma';
import { uploadToCloudinary } from '../lib/cloudinary';
import { sendApplicationEmail } from '../utils/email';
import { JobStatus } from '../generated/prisma/client';

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
    return candidate;
  },

  async updateProfile(userId: string, data: Record<string, unknown>, avatarBuffer?: Buffer) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
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

  async applyJob(userId: string, jobId: string, cvUrl: string, coverLetter?: string) {
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

    const application = await prisma.application.create({
      data: { jobId, candidateId: candidate.id, cvUrl, coverLetter },
    });

    sendApplicationEmail(job.employer.user.email, job.title, candidate.fullName).catch(console.error);

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
};
