import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { skillService } from '../services/skill.service';
import { SkillCategory } from '../generated/prisma/client';

const router = Router();

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.nativeEnum(SkillCategory).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, category, limit } = searchSchema.parse(req.query);
    res.json(await skillService.search(q ?? '', category, limit ?? 20));
  } catch (err) { next(err); }
});

const trendingSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
  category: z.nativeEnum(SkillCategory).optional(),
});

router.get('/trending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, category } = trendingSchema.parse(req.query);
    res.json(await skillService.listTrending(limit ?? 10, category));
  } catch (err) { next(err); }
});

const similarSchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(10).optional(),
});

router.get('/similar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, limit } = similarSchema.parse(req.query);
    res.json(await skillService.findSimilar(q ?? '', limit ?? 3));
  } catch (err) { next(err); }
});

router.get('/by-category', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const all = await skillService.listAll();
    const grouped: Record<string, typeof all> = {};
    for (const s of all) {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    }
    res.json(grouped);
  } catch (err) { next(err); }
});

router.post('/recompute', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await skillService.recomputeJobCounts();
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
});

export default router;
