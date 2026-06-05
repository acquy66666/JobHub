import api from "@/lib/api";
import type { JobTier, CreditPackage, PaymentOrder, PaymentProvider, PaymentStatus } from "./billing";

export type Granularity = "day" | "week" | "month" | "year";
export type CouponDiscountType = "PERCENT" | "FIXED" | "BONUS_CREDITS";
export type CouponStatus = "ACTIVE" | "PAUSED" | "EXPIRED";

export interface RevenueStats {
  granularity: Granularity;
  from: string;
  to: string;
  series: { bucket: string; revenue: number; orders: number }[];
  byProvider: { provider: string; revenue: number; orders: number }[];
  summary: {
    totalRevenue: number;
    successOrders: number;
    pendingOrders: number;
    avgOrderValue: number;
  };
}

export interface AdminOrder extends PaymentOrder {
  employer?: { id: string; companyName: string };
  package?: CreditPackage;
}

export interface AdminCoupon {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  bonusCredits: number;
  appliesTo?: JobTier | null;
  minAmount?: number | null;
  maxRedemptions?: number | null;
  perEmployerLimit: number;
  startsAt: string;
  endsAt: string;
  status: CouponStatus;
  createdAt: string;
  _count?: { redemptions: number };
}

export const adminBillingApi = {
  // Packages
  listPackages: () => api.get<CreditPackage[]>("/admin/billing/packages").then((r) => r.data),
  createPackage: (input: Omit<CreditPackage, "id">) =>
    api.post<CreditPackage>("/admin/billing/packages", input).then((r) => r.data),
  updatePackage: (id: string, input: Partial<Omit<CreditPackage, "id">>) =>
    api.patch<CreditPackage>(`/admin/billing/packages/${id}`, input).then((r) => r.data),
  deactivatePackage: (id: string) =>
    api.delete(`/admin/billing/packages/${id}`).then((r) => r.data),

  // Orders + Stats
  listOrders: (params: {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    provider?: PaymentProvider;
    employerId?: string;
  }) =>
    api
      .get<{ orders: AdminOrder[]; total: number; totalPages: number }>("/admin/billing/orders", {
        params,
      })
      .then((r) => r.data),
  getStats: (params: { granularity?: Granularity; from?: string; to?: string } = {}) =>
    api.get<RevenueStats>("/admin/billing/stats", { params }).then((r) => r.data),

  // Manual grant
  grantCredits: (input: { employerId: string; tier: JobTier; amount: number; note: string }) =>
    api.patch("/admin/billing/credits", input).then((r) => r.data),

  // Coupons
  listCoupons: () => api.get<AdminCoupon[]>("/admin/coupons").then((r) => r.data),
  createCoupon: (input: Omit<AdminCoupon, "id" | "createdAt" | "_count">) =>
    api.post<AdminCoupon>("/admin/coupons", input).then((r) => r.data),
  updateCoupon: (id: string, input: Partial<Omit<AdminCoupon, "id" | "createdAt" | "_count">>) =>
    api.patch<AdminCoupon>(`/admin/coupons/${id}`, input).then((r) => r.data),
  expireCoupon: (id: string) => api.delete(`/admin/coupons/${id}`).then((r) => r.data),
};

export const PROVIDER_COLOR: Record<string, string> = {
  VNPAY: "#3B82F6",
  MOMO: "#A50064",
};

export const STATUS_BADGE: Record<PaymentStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  SUCCESS: "bg-green-500/10 text-green-400 border-green-500/20",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  EXPIRED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function formatVnd(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

export function presetRange(preset: "7d" | "30d" | "12m" | "5y"): { from: string; to: string; granularity: Granularity } {
  const now = new Date();
  const to = now.toISOString();
  const fromDate = new Date(now);
  if (preset === "7d") {
    fromDate.setDate(fromDate.getDate() - 6);
    return { from: fromDate.toISOString(), to, granularity: "day" };
  }
  if (preset === "30d") {
    fromDate.setDate(fromDate.getDate() - 29);
    return { from: fromDate.toISOString(), to, granularity: "day" };
  }
  if (preset === "12m") {
    fromDate.setMonth(fromDate.getMonth() - 11);
    return { from: fromDate.toISOString(), to, granularity: "month" };
  }
  fromDate.setFullYear(fromDate.getFullYear() - 4);
  return { from: fromDate.toISOString(), to, granularity: "year" };
}
