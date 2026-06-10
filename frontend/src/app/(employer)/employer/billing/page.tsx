"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { MonoNumber } from "@/components/ui/MonoNumber";
import {
  billingApi,
  CreditBalance,
  CreditTransaction,
  PaymentOrder,
  formatVnd,
} from "@/lib/api/billing";

const TX_TYPE_LABEL: Record<string, string> = {
  PURCHASE_CREDITS: "mua credits",
  REFUND: "hoàn tiền",
  ADMIN_GRANT: "admin cấp",
  JOB_POST_DEDUCT: "đăng tin",
};

const ORDER_STATUS_LABEL: Record<string, { label: string; tone: "default" | "success" | "danger" | "muted" }> = {
  PENDING: { label: "chờ thanh toán", tone: "default" },
  SUCCESS: { label: "thành công", tone: "success" },
  FAILED: { label: "thất bại", tone: "danger" },
  CANCELLED: { label: "đã hủy", tone: "muted" },
  EXPIRED: { label: "hết hạn", tone: "muted" },
};

const TIER_LABEL: Record<string, string> = {
  BASIC: "basic",
  PREMIUM: "premium",
  VIP: "vip",
};

export default function EmployerBillingPage() {
  const [tab, setTab] = useState<"transactions" | "orders">("transactions");
  const [txPage, setTxPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);

  const { data: balance, isLoading: balanceLoading } = useQuery<CreditBalance>({
    queryKey: ["billing", "balance"],
    queryFn: () => billingApi.getBalance(),
    staleTime: 30_000,
  });

  const { data: txData } = useQuery({
    queryKey: ["billing", "transactions", txPage],
    queryFn: () => billingApi.listTransactions(txPage, 10),
    enabled: tab === "transactions",
  });

  const { data: orderData } = useQuery({
    queryKey: ["billing", "orders", orderPage],
    queryFn: () => billingApi.listOrders(orderPage, 10),
    enabled: tab === "orders",
  });

  const tiers: Array<["BASIC" | "PREMIUM" | "VIP", number]> = [
    ["BASIC", balance?.basicCredits ?? 0],
    ["PREMIUM", balance?.premiumCredits ?? 0],
    ["VIP", balance?.vipCredits ?? 0],
  ];

  return (
    <div className="pb-10">
      <section className="px-4 md:px-6 py-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-[clamp(26px,3.5vw,36px)] font-medium tracking-tight text-[var(--t0)]">Credits</h1>
          <p className="font-mono text-[13px] text-[var(--t1)] mt-2">{`> dùng credits để đăng tin · mỗi tier giá trị + thời hạn boost khác nhau`}</p>
        </div>
        <Link
          href="/employer/billing/shop"
          className="font-mono text-[13px] border border-[var(--accent)] text-[var(--accent)] rounded-sharp px-4 py-2 hover:bg-[var(--accent-dim)] transition-colors"
        >
          + mua credits
        </Link>
      </section>

      <HairlineSection label="SỐ DƯ HIỆN TẠI">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
          {tiers.map(([tier, count]) => (
            <div key={tier} className="px-4 md:px-6 py-5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--t2)] mb-3">{TIER_LABEL[tier]}</p>
              <MonoNumber size="lg" tone={count > 0 ? "accent" : "muted"}>
                {balanceLoading ? "…" : String(count).padStart(2, "0")}
              </MonoNumber>
              <p className="font-mono text-[11px] text-[var(--t2)] mt-2">credits còn lại</p>
            </div>
          ))}
        </div>
      </HairlineSection>

      <div className="px-4 md:px-6 pt-6 pb-2 flex gap-4 font-mono text-[13px]">
        {(["transactions", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`transition-colors ${
              tab === t ? "text-[var(--accent)]" : "text-[var(--t2)] hover:text-[var(--t0)]"
            }`}
          >
            {tab === t ? "[" : " "}
            {t === "transactions" ? "lịch sử credits" : "đơn hàng"}
            {tab === t ? "]" : " "}
          </button>
        ))}
      </div>

      {tab === "transactions" && (
        <HairlineSection label="LỊCH SỬ GIAO DỊCH">
          {!txData ? (
            <p className="px-4 md:px-6 py-6 font-mono text-[12px] text-[var(--t2)]">đang tải…</p>
          ) : txData.transactions.length === 0 ? (
            <p className="px-4 md:px-6 py-6 font-mono text-[12px] text-[var(--t2)]">chưa có giao dịch nào.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] min-w-[600px]">
                  <thead className="font-mono text-[11px] uppercase tracking-wider text-[var(--t2)] border-b border-[var(--border)]">
                    <tr>
                      <th className="text-left px-4 md:px-6 py-3 font-normal">loại</th>
                      <th className="text-left px-4 py-3 font-normal">tier</th>
                      <th className="text-right px-4 py-3 font-normal">Δ</th>
                      <th className="text-right px-4 py-3 font-normal">còn lại</th>
                      <th className="text-left px-4 py-3 font-normal">ghi chú</th>
                      <th className="text-right px-4 md:px-6 py-3 font-normal">thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txData.transactions.map((tx: CreditTransaction) => (
                      <tr key={tx.id} className="border-b border-[var(--border)]">
                        <td className="px-4 md:px-6 py-3 text-[var(--t0)]">{TX_TYPE_LABEL[tx.type] ?? tx.type}</td>
                        <td className="px-4 py-3 font-mono text-[var(--t1)]">{tx.tier ? TIER_LABEL[tx.tier] : "—"}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums">
                          <span className={tx.delta >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"}>
                            {tx.delta >= 0 ? `+${tx.delta}` : tx.delta}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--t0)]">{tx.balanceAfter}</td>
                        <td className="px-4 py-3 text-[var(--t2)] max-w-[200px] truncate">{tx.note ?? "—"}</td>
                        <td className="px-4 md:px-6 py-3 text-right font-mono text-[11px] text-[var(--t2)] whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={txPage} total={txData.total} limit={10} onChange={setTxPage} />
            </>
          )}
        </HairlineSection>
      )}

      {tab === "orders" && (
        <HairlineSection label="ĐƠN HÀNG">
          {!orderData ? (
            <p className="px-4 md:px-6 py-6 font-mono text-[12px] text-[var(--t2)]">đang tải…</p>
          ) : orderData.orders.length === 0 ? (
            <p className="px-4 md:px-6 py-6 font-mono text-[12px] text-[var(--t2)]">chưa có đơn hàng nào.</p>
          ) : (
            <>
              <ul className="divide-y divide-[var(--border)]">
                {orderData.orders.map((o: PaymentOrder, i: number) => {
                  const status = ORDER_STATUS_LABEL[o.status] ?? { label: o.status.toLowerCase(), tone: "default" as const };
                  return (
                    <li key={o.id}>
                      <Link
                        href={`/employer/billing/orders/${o.id}`}
                        className="grid grid-cols-[48px_1fr_auto] gap-4 items-center px-4 md:px-6 py-4 hover:bg-[var(--bg-2)] transition-colors"
                      >
                        <MonoNumber size="md" tone="muted">{String(i + 1 + (orderPage - 1) * 10).padStart(2, "0")}</MonoNumber>
                        <div className="min-w-0">
                          <p className="text-[14px] text-[var(--t0)] truncate">{o.package?.name ?? o.packageId}</p>
                          <p className="font-mono text-[11px] text-[var(--t2)] mt-1">
                            {o.provider.toLowerCase()} · {new Date(o.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono tabular-nums text-[14px] text-[var(--t0)]">{formatVnd(o.amountNet)}</p>
                          <p className={`font-mono text-[11px] mt-1 ${
                            status.tone === "success" ? "text-[var(--green)]" :
                            status.tone === "danger" ? "text-[var(--red)]" :
                            status.tone === "muted" ? "text-[var(--t2)]" : "text-[var(--t1)]"
                          }`}>{status.label}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Pagination page={orderPage} total={orderData.total} limit={10} onChange={setOrderPage} />
            </>
          )}
        </HairlineSection>
      )}
    </div>
  );
}

function Pagination({
  page,
  total,
  limit,
  onChange,
}: {
  page: number;
  total: number;
  limit: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t border-[var(--border)] font-mono text-[12px] text-[var(--t2)]">
      <p>trang {page} / {totalPages} · {total} bản ghi</p>
      <div className="flex gap-3">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="disabled:opacity-40 hover:text-[var(--t0)]">
          ← prev
        </button>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className="disabled:opacity-40 hover:text-[var(--t0)]">
          next →
        </button>
      </div>
    </div>
  );
}
