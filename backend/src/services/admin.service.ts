import { prisma } from '../lib/prisma';
import { JobStatus, Role, ReportStatus, Prisma } from '../generated/prisma/client';

export const adminService = {
  async getDashboardStats() {
    const [totalUsers, totalJobs, totalApplications, pendingJobs, monthlyRaw, weeklyUsersRaw, weeklyJobsRaw, weeklyAppsRaw] = await Promise.all([
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
      prisma.$queryRaw<{ week: Date; count: bigint }[]>`
        SELECT DATE_TRUNC('week', "createdAt") as week, COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= NOW() - INTERVAL '8 weeks'
        GROUP BY 1 ORDER BY 1
      `,
      prisma.$queryRaw<{ week: Date; count: bigint }[]>`
        SELECT DATE_TRUNC('week', "createdAt") as week, COUNT(*) as count
        FROM "Job"
        WHERE "createdAt" >= NOW() - INTERVAL '8 weeks'
        GROUP BY 1 ORDER BY 1
      `,
      prisma.$queryRaw<{ week: Date; count: bigint }[]>`
        SELECT DATE_TRUNC('week', "appliedAt") as week, COUNT(*) as count
        FROM "Application"
        WHERE "appliedAt" >= NOW() - INTERVAL '8 weeks'
        GROUP BY 1 ORDER BY 1
      `,
    ]);

    const monthlyData = monthlyRaw.map(r => ({
      month: r.month.toISOString().slice(0, 7),
      count: Number(r.count),
    }));

    const usersMap = new Map(weeklyUsersRaw.map(r => [r.week.toISOString().slice(0, 10), Number(r.count)]));
    const jobsMap = new Map(weeklyJobsRaw.map(r => [r.week.toISOString().slice(0, 10), Number(r.count)]));
    const appsMap = new Map(weeklyAppsRaw.map(r => [r.week.toISOString().slice(0, 10), Number(r.count)]));

    const allWeeks = new Set<string>([...usersMap.keys(), ...jobsMap.keys(), ...appsMap.keys()]);
    const weeklyData = Array.from(allWeeks).sort().map(week => ({
      week,
      users: usersMap.get(week) ?? 0,
      jobs: jobsMap.get(week) ?? 0,
      applications: appsMap.get(week) ?? 0,
    }));

    return { totalUsers, totalJobs, totalApplications, pendingJobs, monthlyData, weeklyData };
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

  async getReports(page: number, limit: number, status?: ReportStatus) {
    const skip = (page - 1) * limit;
    const where: Prisma.ReportWhereInput = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              email: true,
              role: true,
              candidate: { select: { fullName: true } },
              employer: { select: { companyName: true } },
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return { reports, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async updateReport(reportId: string, data: { status: 'REVIEWED' | 'DISMISSED'; adminNote?: string }) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw Object.assign(new Error('Không tìm thấy báo cáo'), { status: 404 });
    return prisma.report.update({
      where: { id: reportId },
      data: { status: data.status as ReportStatus, adminNote: data.adminNote },
    });
  },

  async createReport(reporterId: string, data: {
    targetType: 'JOB';
    targetId: string;
    reason: string;
    description?: string;
  }) {
    if (data.targetType === 'JOB') {
      const job = await prisma.job.findUnique({ where: { id: data.targetId } });
      if (!job) throw Object.assign(new Error('Không tìm thấy tin tuyển dụng'), { status: 404 });
    }
    return prisma.report.create({
      data: {
        reporterId,
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reason as Prisma.ReportCreateInput['reason'],
        description: data.description,
      },
    });
  },
};
