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
};
