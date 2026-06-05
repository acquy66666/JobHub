"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  billingApi,
  CreditBalance,
  CreditTransaction,
  PaymentOrder,
  TIER_META,
  formatVnd,
} from "@/lib/api/billing";
const TX_TYPE_LABEL: Record<string, string> = {
  PURCHASE_CREDITS: "Mua credits",
  REFUND: "Hoàn tiền",
  ADMIN_GRANT: "Admin cấp",
  JOB_POST_DEDUCT: "Đăng tin",
};

const ORDER_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ thanh toán", color: "text-yellow-400" },
  SUCCESS: { label: "Thành công", color: "text-green-400" },
  FAILED: { label: "Thất bại", color: "text-red-400" },
  CANCELLED: { label: "Đã hủy", color: "text-t2" },
  EXPIRED: { label: "Hết hạn", color: "text-t2" },
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
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[12px] uppercase tracking-wider text-t2 mb-1">💳 Billing</p>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-t0">Quản lý credits</h1>
          <p className="text-[13px] text-t1 mt-1">
            Dùng credits để đăng tin. Mỗi tier có giá trị + thời hạn boost khác nhau.
          </p>
        </div>
        <Link
          href="/employer/billing/shop"
          className="px-5 py-2.5 rounded-xl bg-brand-gradient text-white font-semibold text-[13px] text-center"
        >
          ➕ Mua thêm credits
        </Link>
      </div>

      {/* Balance — 3 col */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiers.map(([tier, count]) => {
          const meta = TIER_META[tier];
          return (
            <div
              key={tier}
              className={`p-5 rounded-2xl border ${meta.ring} bg-gradient-to-br ${meta.gradient}`}
            >
              <p className={`text-[12px] uppercase tracking-wider ${meta.text} mb-2`}>
                {meta.label}
              </p>
              <p className="text-[36px] font-black text-t0 leading-none">
                {balanceLoading ? "…" : count}
              </p>
              <p className="text-[11px] text-t1 mt-1">credits còn lại</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-dark">
        {(["transactions", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors ${
              tab === t
                ? "border-primary text-t0"
                : "border-transparent text-t1 hover:text-t0"
            }`}
          >
            {t === "transactions" ? "Lịch sử credits" : "Đơn hàng"}
          </button>
        ))}
      </div>

      {/* Transactions */}
      {tab === "transactions" && (
        <div className="rounded-2xl border border-border-dark bg-bg-1 overflow-hidden">
          {!txData ? (
            <p className="p-6 text-center text-t2 text-[13px]">Đang tải…</p>
          ) : txData.transactions.length === 0 ? (
            <p className="p-6 text-center text-t2 text-[13px]">Chưa có giao dịch nào.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] min-w-[600px]">
                  <thead className="bg-bg-2 text-t2 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-4 py-3">Loại</th>
                      <th className="text-left px-4 py-3">Tier</th>
                      <th className="text-right px-4 py-3">Δ</th>
                      <th className="text-right px-4 py-3">Còn lại</th>
                      <th className="text-left px-4 py-3">Ghi chú</th>
                      <th className="text-right px-4 py-3">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txData.transactions.map((tx: CreditTransaction) => (
                      <tr key={tx.id} className="border-t border-border-dark">
                        <td className="px-4 py-3 text-t0">{TX_TYPE_LABEL[tx.type] ?? tx.type}</td>
                        <td className="px-4 py-3 text-t1">{tx.tier ?? "—"}</td>
                        <td
                          className={`px-4 py-3 text-right font-bold ${tx.delta >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {tx.delta >= 0 ? `+${tx.delta}` : tx.delta}
                        </td>
                        <td className="px-4 py-3 text-right text-t0">{tx.balanceAfter}</td>
                        <td className="px-4 py-3 text-t2 max-w-[200px] truncate">
                          {tx.note ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-t2 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={txPage}
                total={txData.total}
                limit={10}
                onChange={setTxPage}
              />
            </>
          )}
        </div>
      )}

      {/* Orders */}
      {tab === "orders" && (
        <div className="rounded-2xl border border-border-dark bg-bg-1 overflow-hidden">
          {!orderData ? (
            <p className="p-6 text-center text-t2 text-[13px]">Đang tải…</p>
          ) : orderData.orders.length === 0 ? (
            <p className="p-6 text-center text-t2 text-[13px]">Chưa có đơn hàng nào.</p>
          ) : (
            <>
              <div className="divide-y divide-border-dark">
                {orderData.orders.map((o: PaymentOrder) => {
                  const status = ORDER_STATUS_LABEL[o.status] ?? { label: o.status, color: "text-t1" };
                  return (
                    <Link
                      key={o.id}
                      href={`/employer/billing/orders/${o.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-bg-2 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-t0 font-semibold truncate">
                          {o.package?.name ?? o.packageId}
                        </p>
                        <p className="text-[11px] text-t2">
                          {o.provider} · {new Date(o.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-[13px] text-t0 font-bold">{formatVnd(o.amountNet)}</p>
                        <p className={`text-[11px] font-semibold ${status.color}`}>
                          {status.label}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Pagination
                page={orderPage}
                total={orderData.total}
                limit={10}
                onChange={setOrderPage}
              />
            </>
          )}
        </div>
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
    <div className="flex items-center justify-between px-4 py-3 border-t border-border-dark text-[12px]">
      <p className="text-t2">
        Trang {page} / {totalPages} · {total} bản ghi
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg border border-border-dark text-t1 disabled:opacity-40"
        >
          ←
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg border border-border-dark text-t1 disabled:opacity-40"
        >
          →
        </button>
      </div>
    </div>
  );
}

