import { prisma } from '../lib/prisma';
import {
  JobTier,
  NotificationType,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  TransactionType,
} from '../generated/prisma/client';
import { couponService } from './coupon.service';
import { buildPaymentUrl as vnpayBuildUrl } from '../integrations/vnpay';
import { createPayment as momoCreatePayment } from '../integrations/momo';
import { createNotification } from './notification.service';
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '../utils/email';

function err(message: string, status = 400) {
  return Object.assign(new Error(message), { status });
}

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function fieldFor(tier: JobTier) {
  return tier === 'BASIC' ? 'basicCredits' : tier === 'PREMIUM' ? 'premiumCredits' : 'vipCredits';
}

export interface CreateOrderInput {
  employerId: string;
  userId: string;
  packageId: string;
  couponCode?: string;
  provider: PaymentProvider;
  ipAddr: string;
}

export const paymentService = {
  async createOrder(input: CreateOrderInput) {
    const pkg = await prisma.creditPackage.findUnique({ where: { id: input.packageId } });
    if (!pkg || !pkg.isActive) throw err('Gói tin không tồn tại hoặc đã ngừng bán', 404);

    let discountAmount = 0;
    let couponId: string | null = null;
    let bonusFromCoupon = 0;
    if (input.couponCode) {
      const v = await couponService.validate(input.couponCode, input.employerId, input.packageId);
      discountAmount = v.discountAmount;
      bonusFromCoupon = v.bonusCredits;
      couponId = v.couponId;
    }
    const amountGross = pkg.priceVnd;
    const amountNet = Math.max(0, amountGross - discountAmount);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const orderId = genId('ord');

    const order = await prisma.paymentOrder.create({
      data: {
        id: orderId,
        employerId: input.employerId,
        packageId: input.packageId,
        couponId,
        provider: input.provider,
        status: PaymentStatus.PENDING,
        amountGross,
        discountAmount,
        amountNet,
        expiresAt,
      },
    });

    let payUrl = '';
    let qrCodeUrl: string | null = null;
    let providerTxnRef = orderId;

    if (input.provider === PaymentProvider.VNPAY) {
      const r = vnpayBuildUrl({
        orderId,
        amountVnd: amountNet,
        orderInfo: `Thanh toan don ${orderId}`,
        ipAddr: input.ipAddr,
        expiresAt,
      });
      payUrl = r.payUrl;
      providerTxnRef = r.txnRef;
    } else if (input.provider === PaymentProvider.MOMO) {
      const r = await momoCreatePayment({
        orderId,
        amountVnd: amountNet,
        orderInfo: `Thanh toan don ${orderId}`,
      });
      payUrl = r.payUrl;
      qrCodeUrl = r.qrCodeUrl;
    }

    const updated = await prisma.paymentOrder.update({
      where: { id: orderId },
      data: { payUrl, qrCodeUrl, providerTxnRef },
    });

    // Tag bonusFromCoupon on order metadata via ipnPayload's pending field — we keep it computed at markPaid by re-validating
    return {
      id: updated.id,
      payUrl: updated.payUrl,
      qrCodeUrl: updated.qrCodeUrl,
      expiresAt: updated.expiresAt,
      amountGross,
      discountAmount,
      amountNet,
      bonusFromCoupon,
    };
  },

  // Atomic credit application — called from webhook handlers after signature verify
  async markPaid(
    orderId: string,
    ipnPayload: Record<string, unknown>,
    providerResponseCode: string,
  ): Promise<{ alreadyProcessed: boolean }> {
    const result = await prisma.$transaction(async (tx) => {
      // Pessimistic lock on order row
      const locked = await tx.$queryRawUnsafe<Array<{ id: string; status: string; employerId: string; packageId: string; couponId: string | null; amountNet: number }>>(
        `SELECT id, status, "employerId", "packageId", "couponId", "amountNet" FROM "PaymentOrder" WHERE id = $1 FOR UPDATE`,
        orderId,
      );
      if (locked.length === 0) throw err('Đơn hàng không tồn tại', 404);
      const order = locked[0];
      if (order.status === 'SUCCESS') return { alreadyProcessed: true };
      if (order.status === 'CANCELLED' || order.status === 'EXPIRED') {
        throw err(`Đơn ở trạng thái ${order.status} không thể đánh dấu thành công`);
      }

      const pkg = await tx.creditPackage.findUnique({ where: { id: order.packageId } });
      if (!pkg) throw err('Gói tin không tồn tại', 404);

      // Lock balance row
      await tx.$queryRawUnsafe(
        `SELECT id FROM "EmployerCreditBalance" WHERE "employerId" = $1 FOR UPDATE`,
        order.employerId,
      );
      let balance = await tx.employerCreditBalance.findUnique({ where: { employerId: order.employerId } });
      if (!balance) {
        balance = await tx.employerCreditBalance.create({
          data: {
            id: `bal-${order.employerId}`,
            employerId: order.employerId,
            basicCredits: 0,
            premiumCredits: 0,
            vipCredits: 0,
          },
        });
      }

      let creditDelta = pkg.creditAmount + pkg.bonusCredits;
      let bonusTier: JobTier = pkg.tier;

      if (order.couponId) {
        const coupon = await tx.coupon.findUnique({ where: { id: order.couponId } });
        if (coupon && coupon.discountType === 'BONUS_CREDITS') {
          if (coupon.appliesTo == null || coupon.appliesTo === pkg.tier) {
            creditDelta += coupon.bonusCredits;
          }
          bonusTier = coupon.appliesTo ?? pkg.tier;
        }
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { redeemedCount: { increment: 1 } },
        });
        await tx.couponRedemption.create({
          data: {
            id: genId('red'),
            couponId: order.couponId,
            employerId: order.employerId,
            paymentOrderId: order.id,
          },
        });
      }

      const field = fieldFor(pkg.tier);
      const balanceAfter = balance[field] + creditDelta;
      await tx.employerCreditBalance.update({
        where: { id: balance.id },
        data: { [field]: balanceAfter },
      });

      await tx.creditTransaction.create({
        data: {
          id: genId('txn'),
          employerId: order.employerId,
          type: TransactionType.PURCHASE_CREDITS,
          tier: pkg.tier,
          delta: creditDelta,
          balanceAfter,
          paymentOrderId: order.id,
        },
      });

      await tx.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
          providerResponseCode,
          ipnPayload: ipnPayload as Prisma.InputJsonValue,
        },
      });

      return { alreadyProcessed: false, employerId: order.employerId, tier: pkg.tier, creditDelta, bonusTier };
    });

    if (result.alreadyProcessed) return { alreadyProcessed: true };

    // Side effects outside transaction
    try {
      const employer = await prisma.employer.findUnique({
        where: { id: (result as { employerId: string }).employerId },
        include: { user: { select: { email: true } } },
      });
      if (employer?.user.email) {
        await sendPaymentSuccessEmail(employer.user.email, orderId, (result as { tier: JobTier; creditDelta: number }).creditDelta, (result as { tier: JobTier }).tier);
        await createNotification({
          userId: employer.userId,
          type: NotificationType.CREDIT_PURCHASED,
          title: 'Thanh toán thành công',
          message: `Đã cộng ${(result as { creditDelta: number }).creditDelta} credits ${(result as { tier: JobTier }).tier} vào tài khoản.`,
          link: `/employer/billing/orders/${orderId}`,
        });
      }
    } catch (e) {
      console.error('[payment.markPaid side effects]', e);
    }
    return { alreadyProcessed: false };
  },

  async markFailed(orderId: string, ipnPayload: Record<string, unknown>, responseCode: string) {
    const order = await prisma.paymentOrder.findUnique({ where: { id: orderId } });
    if (!order) return;
    if (order.status === 'SUCCESS' || order.status === 'FAILED') return;
    await prisma.paymentOrder.update({
      where: { id: orderId },
      data: {
        status: PaymentStatus.FAILED,
        providerResponseCode: responseCode,
        ipnPayload: ipnPayload as Prisma.InputJsonValue,
      },
    });
    try {
      const employer = await prisma.employer.findUnique({
        where: { id: order.employerId },
        include: { user: { select: { email: true } } },
      });
      if (employer?.user.email) {
        await sendPaymentFailedEmail(employer.user.email, orderId);
        await createNotification({
          userId: employer.userId,
          type: NotificationType.PAYMENT_FAILED,
          title: 'Thanh toán thất bại',
          message: `Đơn ${orderId} không thành công. Mã: ${responseCode}`,
          link: `/employer/billing/orders/${orderId}`,
        });
      }
    } catch (e) {
      console.error('[payment.markFailed side effects]', e);
    }
  },

  // Helper for Sprint D — consume 1 credit when posting a job, atomic with FOR UPDATE.
  // If `tx` is passed, runs inside caller's transaction (so credit deduct + Job insert can be atomic).
  async consumeCredit(
    employerId: string,
    tier: JobTier,
    jobId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const exec = async (t: Prisma.TransactionClient): Promise<number> => {
      await t.$queryRawUnsafe(
        `SELECT id FROM "EmployerCreditBalance" WHERE "employerId" = $1 FOR UPDATE`,
        employerId,
      );
      let balance = await t.employerCreditBalance.findUnique({ where: { employerId } });
      if (!balance) {
        balance = await t.employerCreditBalance.create({
          data: {
            id: `bal-${employerId}`,
            employerId,
            basicCredits: 0,
            premiumCredits: 0,
            vipCredits: 0,
          },
        });
      }
      const field = fieldFor(tier);
      if (balance[field] < 1) {
        throw Object.assign(new Error(`Hết credits ${tier} — vui lòng mua thêm`), {
          status: 402,
          code: 'INSUFFICIENT_CREDITS',
          requiredTier: tier,
        });
      }
      const balanceAfter = balance[field] - 1;
      await t.employerCreditBalance.update({ where: { id: balance.id }, data: { [field]: balanceAfter } });
      await t.creditTransaction.create({
        data: {
          id: genId('txn'),
          employerId,
          type: TransactionType.JOB_POST_DEDUCT,
          tier,
          delta: -1,
          balanceAfter,
          jobId,
        },
      });
      return balanceAfter;
    };
    if (tx) return exec(tx);
    return prisma.$transaction(exec);
  },
};

export function boostedUntilForTier(tier: JobTier): Date | null {
  const now = Date.now();
  if (tier === 'PREMIUM') return new Date(now + 45 * 24 * 60 * 60 * 1000);
  if (tier === 'VIP') return new Date(now + 60 * 24 * 60 * 60 * 1000);
  return null;
}
