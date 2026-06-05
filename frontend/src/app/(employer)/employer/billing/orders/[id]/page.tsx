"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { billingApi, PaymentOrder, formatVnd } from "@/lib/api/billing";
import { useToast } from "@/store/toastStore";

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: "Chờ thanh toán", bg: "bg-yellow-500/15", text: "text-yellow-300" },
  SUCCESS: { label: "Thành công", bg: "bg-green-500/15", text: "text-green-300" },
  FAILED: { label: "Thất bại", bg: "bg-red-500/15", text: "text-red-300" },
  CANCELLED: { label: "Đã hủy", bg: "bg-bg-3", text: "text-t2" },
  EXPIRED: { label: "Hết hạn", bg: "bg-bg-3", text: "text-t2" },
};

function useCountdown(expiresAt: string | undefined): string {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!expiresAt) return "—";
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return "Đã hết hạn";
  const m = Math.floor(diff / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [redirecting, setRedirecting] = useState(false);
  const [devLoading, setDevLoading] = useState(false);

  const { data: order } = useQuery<PaymentOrder>({
    queryKey: ["billing", "order", orderId],
    queryFn: () => billingApi.getOrder(orderId),
    refetchInterval: (q) => {
      const data = q.state.data as PaymentOrder | undefined;
      return data && data.status !== "PENDING" ? false : 3000;
    },
  });

  const countdown = useCountdown(order?.expiresAt);

  useEffect(() => {
    if (!order) return;
    if (order.status === "SUCCESS" && !redirecting) {
      setRedirecting(true);
      toast.success("Thanh toán thành công! Credits đã được cộng.");
      qc.invalidateQueries({ queryKey: ["billing", "balance"] });
      setTimeout(() => router.push("/employer/billing"), 2000);
    }
    if (order.status === "FAILED" || order.status === "EXPIRED") {
      toast.error(`Đơn hàng ${order.status === "FAILED" ? "thất bại" : "hết hạn"}`);
    }
  }, [order?.status, order, qc, router, toast, redirecting]);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <p className="text-center text-t2 py-12">Đang tải đơn hàng…</p>
      </div>
    );
  }

  const status = STATUS_META[order.status] ?? STATUS_META.PENDING;
  const isPending = order.status === "PENDING";
  // Sandbox VNPay/MoMo chưa đăng ký → cho phép mock từ UI để smoke test. Tắt bằng env NEXT_PUBLIC_HIDE_DEV_PAY=true
  // khi đã wire sandbox thật.
  const isDev =
    typeof window !== "undefined" && process.env.NEXT_PUBLIC_HIDE_DEV_PAY !== "true";

  async function handleDevMarkPaid() {
    setDevLoading(true);
    try {
      await billingApi.devMarkPaid(orderId);
      await qc.invalidateQueries({ queryKey: ["billing", "order", orderId] });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Mock failed";
      toast.error(msg);
    } finally {
      setDevLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 space-y-5">
      <div>
        <p className="text-[12px] uppercase tracking-wider text-t2 mb-1">Đơn hàng</p>
        <h1 className="text-[20px] sm:text-[24px] font-bold text-t0 break-all">{order.id}</h1>
      </div>

      {/* Status */}
      <div className={`p-4 rounded-2xl ${status.bg} border border-border-dark`}>
        <p className={`text-[14px] font-bold ${status.text}`}>{status.label}</p>
        {isPending && (
          <p className="text-[11px] text-t1 mt-1">
            Còn lại <strong className="text-t0">{countdown}</strong> để thanh toán.
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="p-5 rounded-2xl bg-bg-1 border border-border-dark space-y-2 text-[13px]">
        <Row label="Gói" value={order.package?.name ?? order.packageId} />
        <Row label="Provider" value={order.provider} />
        <Row label="Tạm tính" value={formatVnd(order.amountGross)} />
        {order.discountAmount > 0 && (
          <Row label="Giảm giá" value={`-${formatVnd(order.discountAmount)}`} valueClass="text-green-400" />
        )}
        <div className="pt-2 border-t border-border-dark">
          <Row label="Tổng cộng" value={formatVnd(order.amountNet)} valueClass="text-purple-300 font-bold text-[16px]" boldLabel />
        </div>
      </div>

      {/* QR / payUrl */}
      {isPending && (order.qrCodeUrl || order.payUrl) && (
        <div className="p-5 rounded-2xl bg-bg-1 border border-border-dark text-center space-y-3">
          {order.qrCodeUrl && (
            <>
              <p className="text-[12px] text-t1">Quét QR bằng app {order.provider}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.qrCodeUrl}
                alt="QR thanh toán"
                className="max-w-[260px] mx-auto rounded-xl bg-white p-3"
              />
            </>
          )}
          {order.payUrl && (
            <a
              href={order.payUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 rounded-xl bg-brand-gradient text-white font-semibold text-[13px]"
            >
              🔗 Mở trang thanh toán
            </a>
          )}
        </div>
      )}

      {/* Dev panel */}
      {isPending && isDev && (
        <div className="p-4 rounded-2xl border border-dashed border-yellow-500/40 bg-yellow-500/5">
          <p className="text-[11px] uppercase tracking-wider text-yellow-300 mb-2">🛠 Dev only</p>
          <button
            onClick={handleDevMarkPaid}
            disabled={devLoading}
            className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-200 text-[12px] font-bold border border-yellow-500/40 disabled:opacity-50"
          >
            {devLoading ? "Đang mock…" : "Mock thanh toán thành công"}
          </button>
          <p className="text-[10px] text-t2 mt-2">
            Route /api/payments/dev/mark-paid bị disable trên production.
          </p>
        </div>
      )}

      {redirecting && (
        <p className="text-center text-[13px] text-green-400">
          ✓ Đang chuyển về bảng điều khiển…
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
  boldLabel,
}: {
  label: string;
  value: string;
  valueClass?: string;
  boldLabel?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-t1 ${boldLabel ? "font-bold text-t0" : ""}`}>{label}</span>
      <span className={`text-t0 ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}
