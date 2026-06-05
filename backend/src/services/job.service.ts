import { prisma } from '../lib/prisma';
import { JobStatus, JobType, WorkMode, JobTier, Prisma } from '../generated/prisma/client';

interface JobQuery {
  page: number;
  limit: number;
  keyword?: string;
  location?: string;
  industry?: string;
  jobType?: string;
  workMode?: string;
  salaryMin?: number;
  salaryMax?: number;
  employerId?: string;
  tier?: string;
}

export const jobService = {
  async getJobs(query: JobQuery) {
    const { page, limit, keyword, location, industry, jobType, workMode, salaryMin, salaryMax, employerId, tier } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      status: JobStatus.ACTIVE,
      expiresAt: { gte: new Date() },
    };

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (industry) where.industry = { contains: industry, mode: 'insensitive' };
    if (jobType) where.jobType = jobType as JobType;
    if (workMode) where.workMode = workMode as WorkMode;
    if (salaryMin) where.salaryMax = { gte: salaryMin };
    if (salaryMax) where.salaryMin = { lte: salaryMax };
    if (employerId) where.employerId = employerId;
    if (tier && ['BASIC', 'PREMIUM', 'VIP'].includes(tier)) where.tier = tier as JobTier;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { tier: 'desc' },
          { boostedUntil: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
        include: {
          employer: {
            select: { id: true, companyName: true, logoUrl: true, location: true, industry: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return { jobs, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getJobById(id: string) {
    const job = await prisma.job.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      include: {
        employer: {
          select: { id: true, companyName: true, logoUrl: true, location: true, industry: true, website: true, description: true, companySize: true },
        },
        screeningQuestions: {
          orderBy: { order: 'asc' },
          select: { id: true, question: true, type: true, isRequired: true, order: true },
        },
      },
    });
    return job;
  },
};
