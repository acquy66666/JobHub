import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authGuard, AuthRequest } from '../middlewares/authGuard';
import { roleGuard } from '../middlewares/roleGuard';
import { skillProposalService } from '../services/skill-proposal.service';
import { SkillCategory, SkillProposalStatus, Role } from '../generated/prisma/client';

const router = Router();

const createSchema = z.object({
  name: z.string().min(2).max(80),
  nameEn: z.string().max(80).optional(),
  category: z.nativeEnum(SkillCategory),
  reason: z.string().max(500).optional(),
});

router.post('/', authGuard, roleGuard('CANDIDATE', 'EMPLOYER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = createSchema.parse(req.body);
    const created = await skillProposalService.create(req.user!.userId, req.user!.role as Role, body);
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.get('/mine', authGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await skillProposalService.listMine(req.user!.userId));
  } catch (err) { next(err); }
});

const listAdminSchema = z.object({
  status: z.nativeEnum(SkillProposalStatus).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

router.get('/admin', authGuard, roleGuard('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, page, limit } = listAdminSchema.parse(req.query);
    res.json(await skillProposalService.listForAdmin(status, page ?? 1, limit ?? 20));
  } catch (err) { next(err); }
});

const approveSchema = z.object({ adminNote: z.string().max(500).optional() });
const rejectSchema = z.object({ adminNote: z.string().min(1).max(500) });

router.patch('/admin/:id/approve', authGuard, roleGuard('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { adminNote } = approveSchema.parse(req.body);
    res.json(await skillProposalService.approve(req.params.id as string, req.user!.userId, adminNote));
  } catch (err) { next(err); }
});

router.patch('/admin/:id/reject', authGuard, roleGuard('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { adminNote } = rejectSchema.parse(req.body);
    res.json(await skillProposalService.reject(req.params.id as string, req.user!.userId, adminNote));
  } catch (err) { next(err); }
});

export default router;
