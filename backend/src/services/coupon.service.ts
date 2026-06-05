import { prisma } from '../lib/prisma';
import { CouponDiscountType, CouponStatus, JobTier } from '../generated/prisma/client';

export interface ValidatedCoupon {
  couponId: string;
  code: string;
  discountAmount: number;
  bonusCredits: number;
  bonusTier: JobTier | null;
  discountType: CouponDiscountType;
}

function err(message: string, status = 400) {
  return Object.assign(new Error(message), { status });
}

export const couponService = {
  async validate(code: string, employerId: string, packageId: string): Promise<ValidatedCoupon> {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (!coupon) throw err('Mã khuyến mãi không tồn tại', 404);
    if (coupon.status !== CouponStatus.ACTIVE) throw err('Mã khuyến mãi không còn hiệu lực');
    const now = new Date();
    if (coupon.startsAt > now) throw err('Mã khuyến mãi chưa bắt đầu');
    if (coupon.endsAt < now) throw err('Mã khuyến mãi đã hết hạn');
    if (coupon.maxRedemptions != null && coupon.redeemedCount >= coupon.maxRedemptions) {
      throw err('Mã khuyến mãi đã hết lượt sử dụng');
    }
    const pkg = await prisma.creditPackage.findUnique({ where: { id: packageId } });
    if (!pkg) throw err('Gói tin không tồn tại', 404);
    if (coupon.appliesTo && coupon.appliesTo !== pkg.tier) {
      throw err(`Mã chỉ áp dụng cho gói ${coupon.appliesTo}`);
    }
    if (coupon.minAmount != null && pkg.priceVnd < coupon.minAmount) {
      throw err(`Đơn tối thiểu ${coupon.minAmount.toLocaleString('vi-VN')}đ`);
    }
    const usedByEmployer = await prisma.couponRedemption.count({
      where: { couponId: coupon.id, employerId },
    });
    if (usedByEmployer >= coupon.perEmployerLimit) {
      throw err('Bạn đã sử dụng mã này');
    }

    let discountAmount = 0;
    let bonusCredits = 0;
    if (coupon.discountType === CouponDiscountType.PERCENT) {
      discountAmount = Math.round((pkg.priceVnd * coupon.discountValue) / 100);
      if (discountAmount > pkg.priceVnd) discountAmount = pkg.priceVnd;
    } else if (coupon.discountType === CouponDiscountType.FIXED) {
      discountAmount = Math.min(coupon.discountValue, pkg.priceVnd);
    } else if (coupon.discountType === CouponDiscountType.BONUS_CREDITS) {
      bonusCredits = coupon.bonusCredits;
    }

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountAmount,
      bonusCredits,
      bonusTier: coupon.appliesTo ?? pkg.tier,
      discountType: coupon.discountType,
    };
  },

  async preview(code: string, employerId: string, packageId: string) {
    const c = await this.validate(code, employerId, packageId);
    const pkg = await prisma.creditPackage.findUnique({ where: { id: packageId } });
    if (!pkg) throw err('Gói tin không tồn tại', 404);
    return {
      code: c.code,
      discountAmount: c.discountAmount,
      bonusCredits: c.bonusCredits,
      priceGross: pkg.priceVnd,
      priceNet: pkg.priceVnd - c.discountAmount,
    };
  },
};
