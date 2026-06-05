"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import {
  adminBillingApi,
  presetRange,
  PROVIDER_COLOR,
  STATUS_BADGE,
  formatVnd,
  type Granularity,
  type AdminOrder,
} from "@/lib/api/admin-billing";
import type { JobTier, PaymentProvider, PaymentStatus } from "@/lib/api/billing";
import { EmployerPicker } from "@/components/admin/EmployerPicker";
import { useToast } from "@/store/toastStore";
import { timeAgo } from "@/lib/formatters";

const TIER_OPTIONS: { value: JobTier; label: string }[] = [
  { value: "BASIC", label: "Basic" },
  { value: "PREMIUM", label: "Premium" },
  { value: "VIP", label: "VIP" },
];

const STATUS_OPTIONS: { value: PaymentStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "SUCCESS", label: "Thành công" },
  { value: "FAILED", label: "Thất bại" },
  { value: "CANCELLED", label: "Đã huỷ" },
  { value: "EXPIRED", label: "Hết hạn" },
];

const STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Chờ",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  CANCELLED: "Đã huỷ",
  EXPIRED: "Hết hạn",
};

const PROVIDER_OPTIONS: { value: PaymentProvider | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "VNPAY", label: "VNPay" },
  { value: "MOMO", label: "MoMo" },
];

const PRESETS: { value: "7d" | "30d" | "12m" | "5y" | "custom"; label: string }[] = [
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "12m", label: "12 tháng" },
  { value: "5y", label: "5 năm" },
  { value: "custom", label: "Tuỳ chỉnh" },
];

type TabKey = "overview" | "orders" | "grant";

export default function AdminBillingPage() {
  const [tab, setTab] = useState<TabKey>("overview");
  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <ScrollReveal direction="up" className="mb-6">
        <h1 className="text-[28px] font-extrabold text-t0 tracking-tight">Quản lý doanh thu</h1>
        <p className="text-[15px] text-t1 mt-1">Tổng quan doanh thu, đơn hàng và cấp credit thủ công.</p>
      </ScrollReveal>

      <div className="mb-5 flex gap-2 border-b border-border-dark overflow-x-auto">
        {(
          [
            { key: "overview", label: "Tổng quan" },
            { key: "orders", label: "Đơn hàng" },
            { key: "grant", label: "Cấp credit thủ công" },
          ] as { key: TabKey; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-t0"
                : "border-transparent text-t1 hover:text-t0"
            }`}
            role="tab"
            aria-selected={tab === t.key}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "orders" && <OrdersTab />}
      {tab === "grant" && <GrantTab />}
    </div>
  );
}

function OverviewTab() {
  const [preset, setPreset] = useState<"7d" | "30d" | "12m" | "5y" | "custom">("12m");
  const initial = presetRange("12m");
  const [granularity, setGranularity] = useState<Granularity>(initial.granularity);
  const [from, setFrom] = useState(initial.from.slice(0, 10));
  const [to, setTo] = useState(initial.to.slice(0, 10));

  const range = useMemo(() => {
    if (preset === "custom") return { granularity, from, to };
    const r = presetRange(preset);
    return { granularity: r.granularity, from: r.from.slice(0, 10), to: r.to.slice(0, 10) };
  }, [preset, granularity, from, to]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "billing", "stats", range],
    queryFn: () =>
      adminBillingApi.getStats({
        granularity: range.granularity,
        from: new Date(range.from + "T00:00:00").toISOString(),
        to: new Date(range.to + "T23:59:59").toISOString(),
      }),
  });

  function selectPreset(value: typeof preset) {
    setPreset(value);
    if (value !== "custom") {
      const r = presetRange(value);
      setGranularity(r.granularity);
      setFrom(r.from.slice(0, 10));
      setTo(r.to.slice(0, 10));
    }
  }

  const summary = data?.summary ?? { totalRevenue: 0, successOrders: 0, pendingOrders: 0, avgOrderValue: 0 };

  return (
    <div className="space-y-6">
      {/* Range picker */}
      <div className="card-dark rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => selectPreset(p.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
                preset === p.value
                  ? "bg-[rgba(124,58,237,.15)] border-[rgba(124,58,237,.4)] text-[#B09BF8]"
                  : "bg-transparent border-border-dark text-t1 hover:border-[rgba(124,58,237,.3)] hover:text-t0"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex flex-wrap gap-2 items-center ml-auto">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-bg-2 border border-border-dark rounded-lg px-3 py-1.5 text-[12px] text-t0"
            />
            <span className="text-t2 text-[12px]">đến</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-bg-2 border border-border-dark rounded-lg px-3 py-1.5 text-[12px] text-t0"
            />
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as Granularity)}
              className="bg-bg-2 border border-border-dark rounded-lg px-3 py-1.5 text-[12px] text-t0"
            >
              <option value="day">Ngày</option>
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
              <option value="year">Năm</option>
            </select>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Tổng doanh thu" value={formatVnd(summary.totalRevenue)} gradient="from-purple-500/15 to-blue-500/10" loading={isLoading} />
        <StatCard label="Đơn thành công" value={summary.successOrders.toString()} gradient="from-green-500/15 to-emerald-500/10" loading={isLoading} />
        <StatCard label="Đơn đang chờ" value={summary.pendingOrders.toString()} gradient="from-yellow-500/15 to-orange-500/10" loading={isLoading} />
        <StatCard label="Giá trị TB" value={formatVnd(summary.avgOrderValue)} gradient="from-blue-500/15 to-cyan-500/10" loading={isLoading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card-dark rounded-2xl p-4">
          <h2 className="text-[15px] font-semibold text-t0 mb-3">Doanh thu theo {granularity === "day" ? "ngày" : granularity === "week" ? "tuần" : granularity === "month" ? "tháng" : "năm"}</h2>
          {isLoading ? (
            <div className="h-[240px] animate-pulse bg-bg-3 rounded-xl" />
          ) : data && data.series.length > 0 ? (
            <div className="overflow-x-auto -mx-2 px-2">
              <div style={{ minWidth: 480 }}>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252538" />
                    <XAxis dataKey="bucket" stroke="#9494B0" fontSize={11} />
                    <YAxis stroke="#9494B0" fontSize={11} tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString())} />
                    <Tooltip
                      contentStyle={{ background: "#13131E", border: "1px solid #252538", borderRadius: 8 }}
                      formatter={(v) => formatVnd(Number(v))}
                    />
                    <Bar dataKey="revenue" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-t2 text-[13px]">Chưa có doanh thu trong khoảng này</div>
          )}
        </div>

        <div className="card-dark rounded-2xl p-4">
          <h2 className="text-[15px] font-semibold text-t0 mb-3">Theo cổng thanh toán</h2>
          {isLoading ? (
            <div className="h-[240px] animate-pulse bg-bg-3 rounded-xl" />
          ) : data && data.byProvider.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.byProvider}
                  dataKey="revenue"
                  nameKey="provider"
                  cx="50%"
                  cy="45%"
                  outerRadius={70}
                  label={(d) => String((d as { provider?: string }).provider ?? "")}
                  labelLine={false}
                >
                  {data.byProvider.map((p) => (
                    <Cell key={p.provider} fill={PROVIDER_COLOR[p.provider] ?? "#9494B0"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#13131E", border: "1px solid #252538", borderRadius: 8 }}
                  formatter={(v) => formatVnd(Number(v))}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-t2 text-[13px]">Chưa có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, gradient, loading }: { label: string; value: string; gradient: string; loading: boolean }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} border border-border-dark rounded-2xl p-4`}>
      <p className="text-[12px] text-t1 mb-1">{label}</p>
      {loading ? (
        <div className="h-7 bg-bg-3 rounded animate-pulse mt-1" />
      ) : (
        <p className="text-[20px] font-extrabold text-t0">{value}</p>
      )}
    </div>
  );
}

function OrdersTab() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [provider, setProvider] = useState<PaymentProvider | "">("");
  const [employerId, setEmployerId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "billing", "orders", { page, status, provider, employerId }],
    queryFn: () =>
      adminBillingApi.listOrders({
        page,
        limit: 20,
        status: status || undefined,
        provider: provider || undefined,
        employerId: employerId || undefined,
      }),
  });

  const orders: AdminOrder[] = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="card-dark rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] text-t2 mb-1 block">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as PaymentStatus | "");
              setPage(1);
            }}
            className="w-full bg-bg-2 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-t2 mb-1 block">Cổng thanh toán</label>
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value as PaymentProvider | "");
              setPage(1);
            }}
            className="w-full bg-bg-2 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0"
          >
            {PROVIDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-t2 mb-1 block">Công ty</label>
          <EmployerPicker
            value={employerId}
            onChange={(id) => {
              setEmployerId(id);
              setPage(1);
            }}
            placeholder="Tất cả công ty"
          />
        </div>
      </div>

      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-bg-1 text-t2 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Mã đơn</th>
                <th className="px-4 py-3 text-left">Công ty</th>
                <th className="px-4 py-3 text-left">Gói</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3 text-left">Cổng</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {isLoading &&
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-5 bg-bg-3 rounded animate-pulse" />
                    </td>
                  </tr>
                ))}
              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-t2">
                    Không có đơn hàng phù hợp
                  </td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-bg-3/40">
                  <td className="px-4 py-3 font-mono text-[11px] text-t1">{o.id.slice(0, 12)}…</td>
                  <td className="px-4 py-3 text-t0">{o.employer?.companyName ?? "—"}</td>
                  <td className="px-4 py-3 text-t1">{o.package?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-t0">{formatVnd(o.amountNet)}</td>
                  <td className="px-4 py-3 text-t1">{o.provider}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md border text-[11px] ${STATUS_BADGE[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-t2 text-[11px]">{timeAgo(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}

function GrantTab() {
  const qc = useQueryClient();
  const toast = useToast();
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [tier, setTier] = useState<JobTier>("BASIC");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const grant = useMutation({
    mutationFn: () =>
      adminBillingApi.grantCredits({
        employerId: employerId!,
        tier,
        amount: parseInt(amount, 10),
        note: note.trim(),
      }),
    onSuccess: () => {
      toast.success(`Đã cấp ${amount} ${tier} credit cho ${companyName}`);
      setAmount("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["admin", "billing"] });
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi cấp credit";
      toast.error(msg);
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!employerId) return toast.error("Chọn công ty trước");
    const amt = parseInt(amount, 10);
    if (!Number.isFinite(amt) || amt === 0) return toast.error("Số lượng phải khác 0");
    if (!note.trim()) return toast.error("Nhập lý do");
    grant.mutate();
  }

  return (
    <form onSubmit={submit} className="card-dark rounded-2xl p-5 max-w-xl space-y-4">
      <p className="text-[13px] text-t1">
        Cấp hoặc trừ credit thủ công cho một công ty. Số âm để trừ (vd: <code className="text-t0">-2</code>).
      </p>

      <div>
        <label className="text-[12px] text-t2 mb-1 block">Công ty</label>
        <EmployerPicker
          value={employerId}
          onChange={(id, name) => {
            setEmployerId(id);
            setCompanyName(name);
          }}
        />
      </div>

      <div>
        <label className="text-[12px] text-t2 mb-1 block">Hạng credit</label>
        <div className="flex gap-2">
          {TIER_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setTier(o.value)}
              className={`flex-1 px-3 py-2 rounded-xl text-[13px] border transition-colors ${
                tier === o.value
                  ? "bg-[rgba(124,58,237,.15)] border-[rgba(124,58,237,.4)] text-[#B09BF8]"
                  : "border-border-dark text-t1 hover:border-[rgba(124,58,237,.3)]"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[12px] text-t2 mb-1 block">Số lượng (âm = trừ)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="vd: 5 hoặc -2"
          className="w-full bg-bg-2 border border-border-dark rounded-xl px-4 py-2.5 text-[13px] text-t0"
        />
      </div>

      <div>
        <label className="text-[12px] text-t2 mb-1 block">Lý do (bắt buộc)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="vd: bù credit do sự cố thanh toán"
          className="w-full bg-bg-2 border border-border-dark rounded-xl px-4 py-2.5 text-[13px] text-t0"
        />
      </div>

      <button
        type="submit"
        disabled={grant.isPending}
        className="btn-primary px-5 py-2.5 rounded-xl text-[13px] font-medium disabled:opacity-50"
      >
        {grant.isPending ? "Đang xử lý..." : "Cấp credit"}
      </button>
    </form>
  );
}
