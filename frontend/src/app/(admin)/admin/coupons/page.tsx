"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import {
  adminBillingApi,
  formatVnd,
  type AdminCoupon,
  type CouponDiscountType,
  type CouponStatus,
} from "@/lib/api/admin-billing";
import type { JobTier } from "@/lib/api/billing";
import { useToast } from "@/store/toastStore";

const DISCOUNT_LABEL: Record<CouponDiscountType, string> = {
  PERCENT: "Giảm %",
  FIXED: "Giảm VND",
  BONUS_CREDITS: "Tặng credits",
};

const STATUS_BADGE: Record<CouponStatus, string> = {
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  PAUSED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  EXPIRED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

interface FormState {
  code: string;
  name: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: string;
  bonusCredits: string;
  appliesTo: JobTier | "";
  minAmount: string;
  maxRedemptions: string;
  perEmployerLimit: string;
  startsAt: string;
  endsAt: string;
  status: CouponStatus;
}

function defaultForm(): FormState {
  const now = new Date();
  const future = new Date();
  future.setMonth(future.getMonth() + 3);
  return {
    code: "",
    name: "",
    description: "",
    discountType: "PERCENT",
    discountValue: "10",
    bonusCredits: "0",
    appliesTo: "",
    minAmount: "",
    maxRedemptions: "",
    perEmployerLimit: "1",
    startsAt: now.toISOString().slice(0, 10),
    endsAt: future.toISOString().slice(0, 10),
    status: "ACTIVE",
  };
}

export default function AdminCouponsPage() {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: adminBillingApi.listCoupons,
  });

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <ScrollReveal direction="up" className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-extrabold text-t0 tracking-tight">Mã giảm giá</h1>
          <p className="text-[15px] text-t1 mt-1">Tạo, chỉnh sửa hoặc hết hạn các mã khuyến mãi.</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary px-4 py-2 rounded-xl text-[13px]">
          + Tạo mã
        </button>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.05}>
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-bg-1 text-t2 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-right">Giá trị</th>
                  <th className="px-4 py-3 text-right">Đã dùng</th>
                  <th className="px-4 py-3 text-left">Hết hạn</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {isLoading &&
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-4 py-3">
                        <div className="h-5 bg-bg-3 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))}
                {coupons?.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-t2">
                      Chưa có mã giảm giá
                    </td>
                  </tr>
                )}
                {coupons?.map((c) => (
                  <tr key={c.id} className="hover:bg-bg-3/40">
                    <td className="px-4 py-3 font-mono text-[12px] text-[#B09BF8]">{c.code}</td>
                    <td className="px-4 py-3 text-t0">{c.name}</td>
                    <td className="px-4 py-3 text-t1">{DISCOUNT_LABEL[c.discountType]}</td>
                    <td className="px-4 py-3 text-right text-t0 font-semibold">
                      {c.discountType === "PERCENT" && `${c.discountValue}%`}
                      {c.discountType === "FIXED" && formatVnd(c.discountValue)}
                      {c.discountType === "BONUS_CREDITS" && `+${c.bonusCredits}`}
                    </td>
                    <td className="px-4 py-3 text-right text-t1">
                      {c._count?.redemptions ?? 0}
                      {c.maxRedemptions ? `/${c.maxRedemptions}` : ""}
                    </td>
                    <td className="px-4 py-3 text-t2 text-[12px]">{new Date(c.endsAt).toLocaleDateString("vi-VN")}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] ${STATUS_BADGE[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setEditing(c)} className="text-[12px] text-[#B09BF8] hover:text-t0">
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {(creating || editing) && (
        <CouponModal
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CouponModal({ initial, onClose }: { initial: AdminCoupon | null; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          code: initial.code,
          name: initial.name,
          description: initial.description ?? "",
          discountType: initial.discountType,
          discountValue: String(initial.discountValue),
          bonusCredits: String(initial.bonusCredits),
          appliesTo: (initial.appliesTo ?? "") as JobTier | "",
          minAmount: initial.minAmount ? String(initial.minAmount) : "",
          maxRedemptions: initial.maxRedemptions ? String(initial.maxRedemptions) : "",
          perEmployerLimit: String(initial.perEmployerLimit),
          startsAt: initial.startsAt.slice(0, 10),
          endsAt: initial.endsAt.slice(0, 10),
          status: initial.status,
        }
      : defaultForm(),
  );

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        discountType: form.discountType,
        discountValue: parseInt(form.discountValue, 10) || 0,
        bonusCredits: parseInt(form.bonusCredits, 10) || 0,
        appliesTo: (form.appliesTo || undefined) as JobTier | undefined,
        minAmount: form.minAmount ? parseInt(form.minAmount, 10) : undefined,
        maxRedemptions: form.maxRedemptions ? parseInt(form.maxRedemptions, 10) : undefined,
        perEmployerLimit: parseInt(form.perEmployerLimit, 10) || 1,
        startsAt: new Date(form.startsAt + "T00:00:00").toISOString(),
        endsAt: new Date(form.endsAt + "T23:59:59").toISOString(),
        status: form.status,
      };
      return initial ? adminBillingApi.updateCoupon(initial.id, payload) : adminBillingApi.createCoupon(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast.success(initial ? "Đã cập nhật" : "Đã tạo mã");
      onClose();
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi lưu";
      toast.error(msg);
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return toast.error("Nhập code và tên");
    save.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-2 border border-border-dark rounded-2xl p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-[18px] font-bold text-t0">{initial ? "Sửa mã" : "Tạo mã mới"}</h2>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Code">
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              disabled={!!initial}
              className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0 font-mono uppercase disabled:opacity-60"
            />
          </Field>
          <Field label="Tên">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
            />
          </Field>
        </div>

        <Field label="Mô tả (tuỳ chọn)">
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Loại giảm">
            <select
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value as CouponDiscountType })}
              className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
            >
              <option value="PERCENT">Giảm %</option>
              <option value="FIXED">Giảm VND</option>
              <option value="BONUS_CREDITS">Tặng credits</option>
            </select>
          </Field>
          <Field label={form.discountType === "BONUS_CREDITS" ? "Bonus credits" : "Giá trị"}>
            <input
              type="number"
              value={form.discountType === "BONUS_CREDITS" ? form.bonusCredits : form.discountValue}
              onChange={(e) =>
                form.discountType === "BONUS_CREDITS"
                  ? setForm({ ...form, bonusCredits: e.target.value })
                  : setForm({ ...form, discountValue: e.target.value })
              }
              className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Áp dụng tier (tuỳ chọn)">
            <select
              value={form.appliesTo}
              onChange={(e) => setForm({ ...form, appliesTo: e.target.value as JobTier | "" })}
              className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
            >
              <option value="">Tất cả</option>
              <option value="BASIC">Basic</option>
              <option value="PREMIUM">Premium</option>
              <option value="VIP">VIP</option>
            </select>
          </Field>
          <Field label="Đơn tối thiểu (VND)">
            <input
              type="number"
              value={form.minAmount}
              onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
              placeholder="0 = không giới hạn"
              className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tổng lượt sử dụng">
            <input
              type="number"
              value={form.maxRedemptions}
              onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
              placeholder="Trống = không giới hạn"
              className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
            />
          </Field>
          <Field label="Giới hạn / công ty">
            <input
              type="number"
              value={form.perEmployerLimit}
              onChange={(e) => setForm({ ...form, perEmployerLimit: e.target.value })}
              className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Bắt đầu">
            <input
              type="date"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
            />
          </Field>
          <Field label="Kết thúc">
            <input
              type="date"
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
            />
          </Field>
        </div>

        <Field label="Trạng thái">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as CouponStatus })}
            className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
          >
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="PAUSED">Tạm dừng</option>
            <option value="EXPIRED">Hết hạn</option>
          </select>
        </Field>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] text-t1 hover:text-t0">
            Hủy
          </button>
          <button
            type="submit"
            disabled={save.isPending}
            className="btn-primary px-5 py-2 rounded-xl text-[13px] disabled:opacity-50"
          >
            {save.isPending ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[12px] text-t2 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
