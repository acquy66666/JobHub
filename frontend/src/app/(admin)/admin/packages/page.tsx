"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { adminBillingApi, formatVnd } from "@/lib/api/admin-billing";
import type { CreditPackage, JobTier } from "@/lib/api/billing";
import { TIER_META } from "@/lib/api/billing";
import { useToast } from "@/store/toastStore";

interface FormState {
  name: string;
  tier: JobTier;
  creditAmount: string;
  priceVnd: string;
  bonusCredits: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  tier: "BASIC",
  creditAmount: "1",
  priceVnd: "50000",
  bonusCredits: "0",
  sortOrder: "0",
  isActive: true,
};

export default function AdminPackagesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState<CreditPackage | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: packages, isLoading } = useQuery({
    queryKey: ["admin", "billing", "packages"],
    queryFn: adminBillingApi.listPackages,
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminBillingApi.updatePackage(id, { isActive }),
    onSuccess: (_d, { isActive }) => {
      qc.invalidateQueries({ queryKey: ["admin", "billing", "packages"] });
      toast.success(isActive ? "Đã bật gói" : "Đã ẩn gói");
    },
    onError: () => toast.error("Lỗi cập nhật"),
  });

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <ScrollReveal direction="up" className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-extrabold text-t0 tracking-tight">Quản lý gói credit</h1>
          <p className="text-[15px] text-t1 mt-1">Tạo, sửa hoặc tắt các gói credit hiển thị trên shop.</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary px-4 py-2 rounded-xl text-[13px]">
          + Thêm gói
        </button>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.05}>
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-bg-1 text-t2 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Tên gói</th>
                  <th className="px-4 py-3 text-left">Hạng</th>
                  <th className="px-4 py-3 text-right">Credits</th>
                  <th className="px-4 py-3 text-right">Bonus</th>
                  <th className="px-4 py-3 text-right">Giá</th>
                  <th className="px-4 py-3 text-center">Sắp xếp</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {isLoading &&
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-4 py-3">
                        <div className="h-5 bg-bg-3 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))}
                {packages?.map((p) => (
                  <tr key={p.id} className="hover:bg-bg-3/40">
                    <td className="px-4 py-3 text-t0 font-medium">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] ${TIER_META[p.tier].text} ${TIER_META[p.tier].ring}`}>
                        {TIER_META[p.tier].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-t1">{p.creditAmount}</td>
                    <td className="px-4 py-3 text-right text-t1">{p.bonusCredits || "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-t0">{formatVnd(p.priceVnd)}</td>
                    <td className="px-4 py-3 text-center text-t2">{p.sortOrder}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive.mutate({ id: p.id, isActive: !p.isActive })}
                        className={`px-2 py-0.5 rounded-md border text-[11px] ${
                          p.isActive
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}
                      >
                        {p.isActive ? "Đang bật" : "Đã ẩn"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditing(p)}
                        className="text-[12px] text-[#B09BF8] hover:text-t0"
                      >
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
        <PackageModal
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

function PackageModal({ initial, onClose }: { initial: CreditPackage | null; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          name: initial.name,
          tier: initial.tier,
          creditAmount: String(initial.creditAmount),
          priceVnd: String(initial.priceVnd),
          bonusCredits: String(initial.bonusCredits),
          sortOrder: String(initial.sortOrder),
          isActive: initial.isActive,
        }
      : EMPTY_FORM,
  );

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name.trim(),
        tier: form.tier,
        creditAmount: parseInt(form.creditAmount, 10),
        priceVnd: parseInt(form.priceVnd, 10),
        bonusCredits: parseInt(form.bonusCredits, 10) || 0,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
        isActive: form.isActive,
      };
      return initial ? adminBillingApi.updatePackage(initial.id, payload) : adminBillingApi.createPackage(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "billing", "packages"] });
      toast.success(initial ? "Đã cập nhật" : "Đã tạo gói mới");
      onClose();
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi lưu gói";
      toast.error(msg);
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Nhập tên gói");
    save.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-2 border border-border-dark rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-[18px] font-bold text-t0">{initial ? "Sửa gói" : "Thêm gói mới"}</h2>

        <Field label="Tên gói">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
          />
        </Field>

        <Field label="Hạng">
          <select
            value={form.tier}
            onChange={(e) => setForm({ ...form, tier: e.target.value as JobTier })}
            className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
          >
            <option value="BASIC">Basic</option>
            <option value="PREMIUM">Premium</option>
            <option value="VIP">VIP</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Số credits">
            <input
              type="number"
              value={form.creditAmount}
              onChange={(e) => setForm({ ...form, creditAmount: e.target.value })}
              className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
            />
          </Field>
          <Field label="Bonus credits">
            <input
              type="number"
              value={form.bonusCredits}
              onChange={(e) => setForm({ ...form, bonusCredits: e.target.value })}
              className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
            />
          </Field>
        </div>

        <Field label="Giá (VND)">
          <input
            type="number"
            value={form.priceVnd}
            onChange={(e) => setForm({ ...form, priceVnd: e.target.value })}
            className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
          />
        </Field>

        <Field label="Thứ tự sắp xếp">
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
          />
        </Field>

        <label className="flex items-center gap-2 text-[13px] text-t1">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Hiển thị trên shop
        </label>

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
