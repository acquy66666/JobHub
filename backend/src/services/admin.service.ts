import { prisma } from '../lib/prisma';
import { JobStatus, Role, Prisma } from '../generated/prisma/client';

export const adminService = {
  async getDashboardStats() {
    const [totalUsers, totalJobs, totalApplications, pendingJobs, monthlyRaw] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.job.count({ where: { status: JobStatus.PENDING } }),
      prisma.$queryRaw<{ month: Date; count: bigint }[]>`
        SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
        FROM "Job"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY 1
        ORDER BY 1
      `,
    ]);

    const monthlyData = monthlyRaw.map(r => ({
      month: r.month.toISOString().slice(0, 7),
      count: Number(r.count),
    }));

    return { totalUsers, totalJobs, totalApplications, pendingJobs, monthlyData };
  },

  async getJobs(page: number, limit: number, status?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.JobWhereInput = {};
    if (status) where.status = status as JobStatus;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employer: { select: { id: true, companyName: true, logoUrl: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return { jobs, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async updateJobStatus(jobId: string, status: 'ACTIVE' | 'REJECTED') {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    return prisma.job.update({
      where: { id: jobId },
      data: { status: status as JobStatus },
    });
  },

  async getUsers(page: number, limit: number, role?: Role, keyword?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role;
    if (keyword) {
      where.email = { contains: keyword, mode: 'insensitive' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          candidate: { select: { fullName: true, avatarUrl: true } },
          employer: { select: { companyName: true, logoUrl: true, isVerified: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async updateUser(userId: string, data: { isActive?: boolean; role?: Role; employerVerified?: boolean }) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { employer: true } });
    if (!user) throw Object.assign(new Error('Không tìm thấy người dùng'), { status: 404 });

    if (data.employerVerified !== undefined && user.employer) {
      await prisma.employer.update({
        where: { userId },
        data: { isVerified: data.employerVerified },
      });
    }

    const { employerVerified: _, ...userData } = data;
    if (Object.keys(userData).length > 0) {
      return prisma.user.update({
        where: { id: userId },
        data: userData,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
        },
      });
    }
    return { id: user.id, email: user.email, role: user.role, isActive: user.isActive, isVerified: user.isVerified, createdAt: user.createdAt };
  },
};
