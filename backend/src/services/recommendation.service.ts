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
      certificates: { where: { status: 'APPROVED' }, select: { certificateSlug: true } },
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
  const candidateCertSlugs = new Set(candidate.certificates.map(c => c.certificateSlug));
  const candidateLocation = candidate.location?.toLowerCase() ?? '';
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const scored = jobs.map(job => {
    // Dimension 1: skills (weight 0.4)
    let matchedSkills: string[];
    let skillScore: number;
    if (Array.isArray(job.skillSlugs) && job.skillSlugs.length > 0) {
      matchedSkills = job.skillSlugs.filter((s) => candidateSkillSlugs.has(s));
      skillScore = matchedSkills.length / job.skillSlugs.length;
    } else {
      const jobText = (job.requirements + ' ' + job.description).toLowerCase();
      matchedSkills = candidateSkills.filter(s => jobText.includes(s));
      skillScore = candidateSkills.length > 0 ? matchedSkills.length / candidateSkills.length : 0;
    }

    // Dimension 2: certificates (weight 0.2)
    const reqCerts = job.requiredCertificateSlugs ?? [];
    const certScore = reqCerts.length === 0
      ? 1
      : reqCerts.filter((s) => candidateCertSlugs.has(s)).length / reqCerts.length;

    // Dimension 3: experience (weight 0.2), graded [0,1]
    let experienceScore: number;
    const years = candidate.totalYearsExperience;
    const min = job.experienceYearsMin;
    const max = job.experienceYearsMax;
    if (years == null || min == null) {
      experienceScore = 0.7;
    } else if (years >= min && (max == null || years <= max)) {
      experienceScore = 1;
    } else if (max != null && years > max) {
      experienceScore = 0.8;
    } else if (years >= min - 1) {
      experienceScore = 0.6;
    } else {
      experienceScore = 0.2;
    }

    // Dimension 4: preferences (weight 0.2) — average of applicable sub-signals
    const subs: number[] = [];
    if (candidate.preferredJobTypes.length > 0) {
      subs.push(candidate.preferredJobTypes.includes(job.jobType) ? 1 : 0);
    }
    if (candidate.preferredWorkModes.length > 0) {
      subs.push(candidate.preferredWorkModes.includes(job.workMode) ? 1 : 0);
    }
    if (candidate.preferredLocations.length > 0) {
      const jobLoc = job.location.toLowerCase();
      subs.push(candidate.preferredLocations.some((l) => jobLoc.includes(l.toLowerCase())) ? 1 : 0);
    }
    if (candidateLocation) {
      subs.push(job.location.toLowerCase().includes(candidateLocation) ? 1 : 0);
    }
    if (familiarIndustries.size > 0) {
      subs.push(familiarIndustries.has(job.industry) ? 1 : 0);
    }
    const ageMs = now - new Date(job.createdAt).getTime();
    subs.push(Math.max(0, 1 - ageMs / thirtyDaysMs));
    const preferenceScore = subs.reduce((a, b) => a + b, 0) / subs.length;

    const totalScore =
      0.4 * skillScore +
      0.2 * certScore +
      0.2 * experienceScore +
      0.2 * preferenceScore;

    return { ...job, matchScore: Math.round(totalScore * 100), matchedSkills };
  });

  return scored
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
