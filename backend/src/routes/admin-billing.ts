import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authGuard, AuthRequest } from '../middlewares/authGuard';
import { roleGuard } from '../middlewares/roleGuard';
import { billingService } from '../services/billing.service';
import { prisma } from '../lib/prisma';
import { logAdminAction } from '../utils/audit';
import { AuditAction, AuditTargetType, CouponDiscountType, CouponStatus, JobTier } from '../generated/prisma/client';

const router = Router();
router.use(authGuard, roleGuard('ADMIN'));

// === Packages ===
router.get('/billing/packages', async (_req, res, next) => {
  try {
    const list = await prisma.creditPackage.findMany({ orderBy: [{ tier: 'asc' }, { sortOrder: 'asc' }] });
    res.json(list);
  } catch (err) { next(err); }
});

const packageSchema = z.object({
  name: z.string().min(1),
  tier: z.enum(['BASIC', 'PREMIUM', 'VIP']),
  creditAmount: z.number().int().positive(),
  priceVnd: z.number().int().positive(),
  bonusCredits: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

router.post('/billing/packages', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = packageSchema.parse(req.body);
    const created = await prisma.creditPackage.create({
      data: { id: `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...data, tier: data.tier as JobTier },
    });
    await logAdminAction(req.user!.userId, AuditAction.PACKAGE_CREATED, AuditTargetType.PACKAGE, created.id, { name: created.name });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.patch('/billing/packages/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const partial = packageSchema.partial().parse(req.body);
    const updated = await prisma.creditPackage.update({ where: { id: String(req.params.id) }, data: partial });
    await logAdminAction(req.user!.userId, AuditAction.PACKAGE_UPDATED, AuditTargetType.PACKAGE, updated.id, partial);
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/billing/packages/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.creditPackage.update({ where: { id: String(req.params.id) }, data: { isActive: false } });
    res.status(204).end();
  } catch (err) { next(err); }
});

// === Orders + Stats ===
router.get('/billing/orders', async (req, res, next) => {
  try {
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 20;
    const status = req.query.status ? String(req.query.status) : undefined;
    const provider = req.query.provider ? String(req.query.provider) : undefined;
    const employerId = req.query.employerId ? String(req.query.employerId) : undefined;
    res.json(await billingService.listAllOrders(page, limit, { status, provider, employerId }));
  } catch (err) { next(err); }
});

router.get('/billing/stats', async (_req, res, next) => {
  try {
    res.json(await billingService.revenueStats());
  } catch (err) { next(err); }
});

const grantSchema = z.object({
  employerId: z.string().min(1),
  tier: z.enum(['BASIC', 'PREMIUM', 'VIP']),
  amount: z.number().int(),
  note: z.string().min(1),
});
router.patch('/billing/credits', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = grantSchema.parse(req.body);
    const updated = await billingService.adminGrantCredits(
      data.employerId,
      data.tier as JobTier,
      data.amount,
      data.note,
      req.user!.userId,
    );
    await logAdminAction(req.user!.userId, AuditAction.CREDITS_GRANTED, AuditTargetType.EMPLOYER_CREDITS, data.employerId, { tier: data.tier, amount: data.amount, note: data.note });
    res.json(updated);
  } catch (err) { next(err); }
});

// === Coupons ===
router.get('/coupons', async (_req, res, next) => {
  try {
    res.json(await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }));
  } catch (err) { next(err); }
});

const couponSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  discountType: z.enum(['PERCENT', 'FIXED', 'BONUS_CREDITS']),
  discountValue: z.number().int().nonnegative(),
  bonusCredits: z.number().int().nonnegative().default(0),
  appliesTo: z.enum(['BASIC', 'PREMIUM', 'VIP']).optional(),
  minAmount: z.number().int().nonnegative().optional(),
  maxRedemptions: z.number().int().positive().optional(),
  perEmployerLimit: z.number().int().positive().default(1),
  startsAt: z.string(),
  endsAt: z.string(),
  status: z.enum(['ACTIVE', 'PAUSED', 'EXPIRED']).default('ACTIVE'),
});

router.post('/coupons', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = couponSchema.parse(req.body);
    const created = await prisma.coupon.create({
      data: {
        id: `cpn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code: data.code.trim().toUpperCase(),
        name: data.name,
        description: data.description,
        discountType: data.discountType as CouponDiscountType,
        discountValue: data.discountValue,
        bonusCredits: data.bonusCredits,
        appliesTo: data.appliesTo as JobTier | undefined,
        minAmount: data.minAmount,
        maxRedemptions: data.maxRedemptions,
        perEmployerLimit: data.perEmployerLimit,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        status: data.status as CouponStatus,
        createdByAdminId: req.user!.userId,
      },
    });
    await logAdminAction(req.user!.userId, AuditAction.COUPON_CREATED, AuditTargetType.COUPON, created.id, { code: created.code });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.patch('/coupons/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const partial = couponSchema.partial().parse(req.body);
    const data: Record<string, unknown> = { ...partial };
    if (partial.startsAt) data.startsAt = new Date(partial.startsAt);
    if (partial.endsAt) data.endsAt = new Date(partial.endsAt);
    if (partial.code) data.code = partial.code.trim().toUpperCase();
    const updated = await prisma.coupon.update({ where: { id: String(req.params.id) }, data });
    await logAdminAction(req.user!.userId, AuditAction.COUPON_UPDATED, AuditTargetType.COUPON, updated.id, partial);
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/coupons/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.coupon.update({ where: { id: String(req.params.id) }, data: { status: 'EXPIRED' } });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
