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
      ...(candidate.preferredSalaryMin != null
        ? { OR: [{ salaryMax: null }, { salaryMax: { gte: candidate.preferredSalaryMin } }] }
        : {}),
    },
    include: {
      employer: { select: { id: true, companyName: true, logoUrl: true, isVerified: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const candidateSkillSlugs = new Set(candidate.skills);
  const candidateSkills = candidate.skills.map(s => s.toLowerCase());
  const candidateLocation = candidate.location?.toLowerCase() ?? '';
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const scored = jobs.map(job => {
    let matchedSkills: string[];
    let skillScore: number;
    if (Array.isArray(job.skillSlugs) && job.skillSlugs.length > 0) {
      // Exact intersection: |candidate ∩ job| / |job|
      matchedSkills = job.skillSlugs.filter((s) => candidateSkillSlugs.has(s));
      skillScore = matchedSkills.length / job.skillSlugs.length;
    } else {
      // Legacy text-substring fallback
      const jobText = (job.requirements + ' ' + job.description).toLowerCase();
      matchedSkills = candidateSkills.filter(s => jobText.includes(s));
      skillScore = candidateSkills.length > 0 ? matchedSkills.length / candidateSkills.length : 0;
    }

    const locationScore = candidateLocation && job.location.toLowerCase().includes(candidateLocation) ? 1 : 0;

    const industryScore = familiarIndustries.has(job.industry) ? 1 : 0;

    const ageMs = now - new Date(job.createdAt).getTime();
    const recencyScore = Math.max(0, 1 - ageMs / thirtyDaysMs);

    let totalScore = 0.5 * skillScore + 0.2 * locationScore + 0.2 * industryScore + 0.1 * recencyScore;

    if (candidate.preferredJobTypes.length > 0 && candidate.preferredJobTypes.includes(job.jobType)) totalScore += 0.15;
    if (candidate.preferredWorkModes.length > 0 && candidate.preferredWorkModes.includes(job.workMode)) totalScore += 0.15;
    if (candidate.preferredLocations.length > 0) {
      const jobLoc = job.location.toLowerCase();
      if (candidate.preferredLocations.some((l) => jobLoc.includes(l.toLowerCase()))) totalScore += 0.10;
    }

    // Experience tier scoring — only when candidate khai báo totalYearsExperience
    if (candidate.totalYearsExperience != null) {
      const years = candidate.totalYearsExperience;
      const min = job.experienceYearsMin;
      const max = job.experienceYearsMax;
      if (min != null && max != null) {
        if (years >= min && years <= max) {
          totalScore += 0.10;
        } else if (years < min - 1) {
          totalScore -= 0.20;
        }
      }
    }

    totalScore = Math.max(0, Math.min(totalScore, 1));

    return { ...job, matchScore: Math.round(totalScore * 100), matchedSkills };
  });

  return scored
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
