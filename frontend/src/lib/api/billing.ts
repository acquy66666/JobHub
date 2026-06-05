import api from "@/lib/api";

export type JobTier = "BASIC" | "PREMIUM" | "VIP";
export type PaymentProvider = "VNPAY" | "MOMO";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "EXPIRED";

export interface CreditBalance {
  basicCredits: number;
  premiumCredits: number;
  vipCredits: number;
  updatedAt?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  tier: JobTier;
  creditAmount: number;
  priceVnd: number;
  bonusCredits: number;
  isActive: boolean;
  sortOrder: number;
}

export interface CouponPreview {
  code: string;
  discountAmount: number;
  bonusCredits: number;
  priceGross: number;
  priceNet: number;
}

export interface PaymentOrder {
  id: string;
  employerId: string;
  packageId: string;
  couponId?: string | null;
  provider: PaymentProvider;
  status: PaymentStatus;
  amountGross: number;
  discountAmount: number;
  amountNet: number;
  qrCodeUrl?: string | null;
  payUrl?: string | null;
  providerTxnRef?: string | null;
  expiresAt: string;
  paidAt?: string | null;
  createdAt: string;
  package?: CreditPackage;
}

export interface CreditTransaction {
  id: string;
  type: "PURCHASE_CREDITS" | "REFUND" | "ADMIN_GRANT" | "JOB_POST_DEDUCT";
  tier: JobTier | null;
  delta: number;
  balanceAfter: number;
  paymentOrderId?: string | null;
  jobId?: string | null;
  note?: string | null;
  createdAt: string;
}

export const billingApi = {
  getBalance: () => api.get<CreditBalance>("/employer/billing/balance").then((r) => r.data),
  getPackages: () => api.get<CreditPackage[]>("/employer/billing/packages").then((r) => r.data),
  validateCoupon: (code: string, packageId: string) =>
    api
      .post<CouponPreview>("/employer/billing/coupons/validate", { code, packageId })
      .then((r) => r.data),
  createOrder: (input: { packageId: string; couponCode?: string; provider: PaymentProvider }) =>
    api.post<PaymentOrder>("/employer/billing/orders", input).then((r) => r.data),
  getOrder: (id: string) =>
    api.get<PaymentOrder>(`/employer/billing/orders/${id}`).then((r) => r.data),
  listOrders: (page = 1, limit = 10) =>
    api
      .get<{ items: PaymentOrder[]; total: number; page: number; limit: number }>(
        `/employer/billing/orders?page=${page}&limit=${limit}`,
      )
      .then((r) => r.data),
  listTransactions: (page = 1, limit = 10) =>
    api
      .get<{ items: CreditTransaction[]; total: number; page: number; limit: number }>(
        `/employer/billing/transactions?page=${page}&limit=${limit}`,
      )
      .then((r) => r.data),
  devMarkPaid: (orderId: string) =>
    api.post("/payments/dev/mark-paid", { orderId }).then((r) => r.data),
};

export const TIER_META: Record<JobTier, { label: string; gradient: string; ring: string; text: string }> = {
  BASIC: {
    label: "Basic",
    gradient: "from-slate-500/30 to-slate-600/20",
    ring: "border-slate-500/40",
    text: "text-slate-200",
  },
  PREMIUM: {
    label: "Premium",
    gradient: "from-purple-500/30 to-blue-500/20",
    ring: "border-purple-500/40",
    text: "text-purple-200",
  },
  VIP: {
    label: "VIP",
    gradient: "from-yellow-500/30 to-orange-500/20",
    ring: "border-yellow-500/40",
    text: "text-yellow-200",
  },
};

export function formatVnd(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}
