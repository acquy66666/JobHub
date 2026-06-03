import { prisma } from '../lib/prisma';
import { JobStatus } from '../generated/prisma/client';

export async function getRecommendedJobs(userId: string, limit: number = 10) {
  const candidate = await prisma.candidate.findUnique({
    where: { userId },
    include: {
      applications: {
        select: { jobId: true, job: { select: { industry: true } } },
      },
      savedJobs: { select: { jobId: true } },
    },
  });
  if (!candidate) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });

  const appliedJobIds = candidate.applications.map(a => a.jobId);
  const savedJobIds = candidate.savedJobs.map(s => s.jobId);
  const familiarIndustries = new Set(candidate.applications.map(a => a.job.industry));
  const excludeIds = [...new Set([...appliedJobIds, ...savedJobIds])];

  const jobs = await prisma.job.findMany({
    where: {
      status: JobStatus.ACTIVE,
      expiresAt: { gt: new Date() },
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
    },
    include: {
      employer: { select: { id: true, companyName: true, logoUrl: true, isVerified: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const candidateSkills = candidate.skills.map(s => s.toLowerCase());
  const candidateLocation = candidate.location?.toLowerCase() ?? '';
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const scored = jobs.map(job => {
    const jobText = (job.requirements + ' ' + job.description).toLowerCase();
    const matchedSkills = candidateSkills.filter(s => jobText.includes(s));
    const skillScore = candidateSkills.length > 0 ? matchedSkills.length / candidateSkills.length : 0;

    const locationScore = candidateLocation && job.location.toLowerCase().includes(candidateLocation) ? 1 : 0;

    const industryScore = familiarIndustries.has(job.industry) ? 1 : 0;

    const ageMs = now - new Date(job.createdAt).getTime();
    const recencyScore = Math.max(0, 1 - ageMs / thirtyDaysMs);

    const totalScore = 0.5 * skillScore + 0.2 * locationScore + 0.2 * industryScore + 0.1 * recencyScore;

    return { ...job, matchScore: Math.round(totalScore * 100), matchedSkills };
  });

  return scored
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
