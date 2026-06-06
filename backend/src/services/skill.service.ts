import { prisma } from '../lib/prisma';
import { Prisma, SkillCategory } from '../generated/prisma/client';

export const skillService = {
  async listAll() {
    return prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { jobCount: 'desc' }, { nameVi: 'asc' }],
    });
  },

  async search(q: string, category?: SkillCategory, limit = 20) {
    const where: Prisma.SkillWhereInput = {};
    if (category) where.category = category;
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { nameVi: { contains: term, mode: 'insensitive' } },
        { nameEn: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term.toLowerCase() } },
        { aliases: { hasSome: [term] } },
      ];
    }
    return prisma.skill.findMany({
      where,
      orderBy: [{ jobCount: 'desc' }, { nameVi: 'asc' }],
      take: limit,
    });
  },

  async validateSlugs(slugs: string[]): Promise<{ valid: string[]; invalid: string[] }> {
    if (slugs.length === 0) return { valid: [], invalid: [] };
    const found = await prisma.skill.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true },
    });
    const validSet = new Set(found.map((s) => s.slug));
    return {
      valid: slugs.filter((s) => validSet.has(s)),
      invalid: slugs.filter((s) => !validSet.has(s)),
    };
  },

  async findSimilar(q: string, limit = 3) {
    if (!q || q.trim().length < 2) return [];
    const term = q.trim();
    const take = Math.min(Math.max(limit, 1), 10);
    return prisma.$queryRawUnsafe<
      Array<{ slug: string; nameVi: string; nameEn: string | null; category: string; jobCount: number; similarity: number }>
    >(
      `SELECT slug, "nameVi", "nameEn", category, "jobCount",
              GREATEST(similarity("nameVi", $1), similarity(COALESCE("nameEn", ''), $1)) AS similarity
       FROM "Skill"
       WHERE similarity("nameVi", $1) > 0.3 OR similarity(COALESCE("nameEn", ''), $1) > 0.3
       ORDER BY similarity DESC
       LIMIT $2`,
      term,
      take,
    );
  },

  async listTrending(limit = 10, category?: SkillCategory) {
    return prisma.skill.findMany({
      where: { jobCount: { gt: 0 }, ...(category && { category }) },
      orderBy: [{ jobCount: 'desc' }, { nameVi: 'asc' }],
      take: Math.min(Math.max(limit, 1), 50),
    });
  },

  async recomputeJobCounts(): Promise<{ skillsTouched: number; jobsScanned: number }> {
    const [skills, jobs] = await Promise.all([
      prisma.skill.findMany({ select: { id: true, slug: true, nameVi: true, nameEn: true, aliases: true } }),
      prisma.job.findMany({
        where: { status: 'ACTIVE', expiresAt: { gte: new Date() } },
        select: { title: true, requirements: true, description: true, skillSlugs: true },
      }),
    ]);

    const slugToId = new Map(skills.map((s) => [s.slug, s.id]));

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const skillPatterns = skills.map((s) => {
      const terms = [s.nameVi, s.nameEn, ...s.aliases].filter((t): t is string => Boolean(t && t.trim()));
      const uniq = Array.from(new Set(terms.map((t) => t.trim())));
      const pattern = new RegExp(`(?<!\\p{L})(${uniq.map(escapeRegex).join('|')})(?!\\p{L})`, 'iu');
      return { id: s.id, pattern };
    });

    const counts = new Map<string, number>();
    for (const job of jobs) {
      if (Array.isArray(job.skillSlugs) && job.skillSlugs.length > 0) {
        // Exact-match path: structured skillSlugs from JobForm
        const seen = new Set<string>();
        for (const slug of job.skillSlugs) {
          const id = slugToId.get(slug);
          if (id && !seen.has(id)) {
            seen.add(id);
            counts.set(id, (counts.get(id) ?? 0) + 1);
          }
        }
      } else {
        // Legacy regex fallback for jobs without skillSlugs
        const text = `${job.title}\n${job.requirements}\n${job.description ?? ''}`;
        for (const { id, pattern } of skillPatterns) {
          if (pattern.test(text)) counts.set(id, (counts.get(id) ?? 0) + 1);
        }
      }
    }

    await prisma.skill.updateMany({ data: { jobCount: 0 } });
    if (counts.size > 0) {
      const ids = Array.from(counts.keys());
      const cases = ids.map((id) => `WHEN '${id.replace(/'/g, "''")}' THEN ${counts.get(id) ?? 0}`).join(' ');
      await prisma.$executeRawUnsafe(
        `UPDATE "Skill" SET "jobCount" = CASE "id" ${cases} ELSE "jobCount" END WHERE "id" IN (${ids.map((id) => `'${id.replace(/'/g, "''")}'`).join(',')})`,
      );
    }

    return { skillsTouched: counts.size, jobsScanned: jobs.length };
  },

  triggerRecompute(): void {
    setImmediate(() => {
      void skillService.recomputeJobCounts().catch((err) => {
        console.error('[skill.recomputeJobCounts] failed:', err);
      });
    });
  },
};
