"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { billingApi, CreditBalance } from "@/lib/api/billing";

export function CreditBadge() {
  const { data } = useQuery<CreditBalance>({
    queryKey: ["billing", "balance"],
    queryFn: () => billingApi.getBalance(),
    staleTime: 30_000,
  });

  const b = data?.basicCredits ?? 0;
  const p = data?.premiumCredits ?? 0;
  const v = data?.vipCredits ?? 0;

  return (
    <Link
      href="/employer/billing"
      className="block mx-3 mb-3 px-3 py-2 rounded-xl border border-border-dark bg-bg-2 hover:bg-bg-3 transition-colors"
      title="Credits — bấm để xem chi tiết"
    >
      <p className="text-[10px] uppercase tracking-wider text-t2 mb-1">💳 Credits</p>
      <div className="flex items-center gap-2 text-[11px] font-semibold">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="text-slate-300">{b}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span className="text-purple-300">{p}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <span className="text-yellow-300">{v}</span>
        </span>
      </div>
    </Link>
  );
}
