import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authGuard, AuthRequest } from '../middlewares/authGuard';
import { roleGuard } from '../middlewares/roleGuard';
import { billingService } from '../services/billing.service';
import { couponService } from '../services/coupon.service';
import { paymentService } from '../services/payment.service';
import { prisma } from '../lib/prisma';
import { PaymentProvider } from '../generated/prisma/client';

const router = Router();
router.use(authGuard, roleGuard('EMPLOYER'));

async function employerIdOf(userId: string): Promise<string> {
  const e = await prisma.employer.findUnique({ where: { userId }, select: { id: true } });
  if (!e) throw Object.assign(new Error('Không tìm thấy hồ sơ công ty'), { status: 404 });
  return e.id;
}

router.get('/balance', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const balance = await billingService.getBalanceByUserId(req.user!.userId);
    res.json(balance);
  } catch (err) { next(err); }
});

router.get('/packages', async (_req, res, next) => {
  try {
    res.json(await billingService.listPackages());
  } catch (err) { next(err); }
});

const validateCouponSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã'),
  packageId: z.string().min(1),
});
router.post('/coupons/validate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code, packageId } = validateCouponSchema.parse(req.body);
    const employerId = await employerIdOf(req.user!.userId);
    const preview = await couponService.preview(code, employerId, packageId);
    res.json(preview);
  } catch (err) { next(err); }
});

const createOrderSchema = z.object({
  packageId: z.string().min(1),
  couponCode: z.string().optional(),
  provider: z.enum(['VNPAY', 'MOMO']),
});
router.post('/orders', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const employerId = await employerIdOf(req.user!.userId);
    const ipAddr = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
    const order = await paymentService.createOrder({
      employerId,
      userId: req.user!.userId,
      packageId: data.packageId,
      couponCode: data.couponCode,
      provider: data.provider as PaymentProvider,
      ipAddr,
    });
    res.status(201).json(order);
  } catch (err) { next(err); }
});

router.get('/orders', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employerId = await employerIdOf(req.user!.userId);
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 10;
    const status = req.query.status ? String(req.query.status) : undefined;
    res.json(await billingService.listOrders(employerId, page, limit, status));
  } catch (err) { next(err); }
});

router.get('/orders/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employerId = await employerIdOf(req.user!.userId);
    res.json(await billingService.getOrder(employerId, String(req.params.id)));
  } catch (err) { next(err); }
});

router.get('/transactions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employerId = await employerIdOf(req.user!.userId);
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 20;
    res.json(await billingService.listTransactions(employerId, page, limit));
  } catch (err) { next(err); }
});

export default router;
