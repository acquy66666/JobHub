"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { MonoNumber } from "@/components/ui/MonoNumber";
import { billingApi, PaymentOrder, formatVnd } from "@/lib/api/billing";
import { useToast } from "@/store/toastStore";

const STATUS_META: Record<string, { label: string; tone: "default" | "success" | "danger" | "muted" | "accent" }> = {
  PENDING: { label: "chờ thanh toán", tone: "accent" },
  SUCCESS: { label: "thành công", tone: "success" },
  FAILED: { label: "thất bại", tone: "danger" },
  CANCELLED: { label: "đã hủy", tone: "muted" },
  EXPIRED: { label: "hết hạn", tone: "muted" },
};

const TONE_CLASS: Record<string, string> = {
  default: "text-[var(--t0)]",
  accent: "text-[var(--accent)]",
  success: "text-[var(--green)]",
  danger: "text-[var(--red)]",
  muted: "text-[var(--t2)]",
};

function useCountdown(expiresAt: string | undefined): string {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!expiresAt) return "—";
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return "00:00";
  const m = Math.floor(diff / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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
      <div className="pb-10">
        <p className="px-4 md:px-6 py-12 font-mono text-[12px] text-[var(--t2)] text-center">đang tải đơn hàng…</p>
      </div>
    );
  }

  const status = STATUS_META[order.status] ?? STATUS_META.PENDING;
  const isPending = order.status === "PENDING";
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
    <div className="pb-10">
      <section className="px-4 md:px-6 py-8">
        <p className="font-mono text-[12px] text-[var(--t2)]">~ / employer / billing / orders</p>
        <h1 className="text-[clamp(22px,3vw,28px)] font-medium tracking-tight text-[var(--t0)] mt-3 break-all font-mono">{order.id}</h1>
        <p className={`font-mono text-[13px] mt-2 ${TONE_CLASS[status.tone]}`}>
          {`> ${status.label}`}
          {isPending && (
            <span className="text-[var(--t1)]">{` · còn `}<MonoNumber size="sm" tone="accent">{countdown}</MonoNumber></span>
          )}
        </p>
      </section>

      <HairlineSection label="CHI TIẾT ĐƠN HÀNG">
        <dl className="divide-y divide-[var(--border)]">
          <Row label="gói" value={order.package?.name ?? order.packageId} />
          <Row label="provider" value={order.provider.toLowerCase()} mono />
          <Row label="tạm tính" value={formatVnd(order.amountGross)} mono />
          {order.discountAmount > 0 && (
            <Row label="giảm giá" value={`-${formatVnd(order.discountAmount)}`} mono valueClass="text-[var(--green)]" />
          )}
          <Row label="tổng cộng" value={formatVnd(order.amountNet)} mono valueClass="text-[var(--accent)] text-[16px]" />
        </dl>
      </HairlineSection>

      {isPending && (order.qrCodeUrl || order.payUrl) && (
        <HairlineSection label="THANH TOÁN">
          <div className="px-4 md:px-6 py-6 text-center space-y-4">
            {order.qrCodeUrl && (
              <>
                <p className="font-mono text-[12px] text-[var(--t1)]">{`> quét QR bằng app ${order.provider.toLowerCase()}`}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.qrCodeUrl}
                  alt="QR thanh toán"
                  className="max-w-[260px] mx-auto bg-white p-3 rounded-sharp"
                />
              </>
            )}
            {order.payUrl && (
              <a
                href={order.payUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-mono text-[13px] border border-[var(--accent)] text-[var(--accent)] rounded-sharp px-5 py-2.5 hover:bg-[var(--accent-dim)] transition-colors"
              >
                → mở trang thanh toán
              </a>
            )}
          </div>
        </HairlineSection>
      )}

      {isPending && isDev && (
        <HairlineSection label="DEV ONLY">
          <div className="px-4 md:px-6 py-4">
            <button
              onClick={handleDevMarkPaid}
              disabled={devLoading}
              className="font-mono text-[12px] border border-dashed border-[var(--accent)] text-[var(--accent)] rounded-sharp px-4 py-2 hover:bg-[var(--accent-dim)] disabled:opacity-50 transition-colors"
            >
              {devLoading ? "đang mock…" : "mock thanh toán thành công"}
            </button>
            <p className="font-mono text-[11px] text-[var(--t2)] mt-2">
              {`// route /api/payments/dev/mark-paid bị disable trên production.`}
            </p>
          </div>
        </HairlineSection>
      )}

      {redirecting && (
        <p className="px-4 md:px-6 py-6 text-center font-mono text-[13px] text-[var(--green)]">
          ✓ đang chuyển về bảng điều khiển…
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
  mono,
}: {
  label: string;
  value: string;
  valueClass?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 text-[13px]">
      <dt className="font-mono text-[12px] text-[var(--t2)] uppercase tracking-wider">{label}</dt>
      <dd className={`${mono ? "font-mono tabular-nums" : ""} text-[var(--t0)] ${valueClass ?? ""}`}>{value}</dd>
    </div>
  );
}
