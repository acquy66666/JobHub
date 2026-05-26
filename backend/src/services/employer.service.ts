import { prisma } from '../lib/prisma';
import { uploadToCloudinary } from '../lib/cloudinary';
import { sendApplicationStatusEmail } from '../utils/email';
import { JobStatus, ApplicationStatus } from '../generated/prisma/client';

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
    return prisma.job.create({
      data: {
        ...data,
        expiresAt: new Date(data.expiresAt as string),
        employerId: employer.id,
        status: JobStatus.PENDING,
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
    sendApplicationStatusEmail(application.candidate.user.email, job.title, status).catch(console.error);
    return updated;
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
