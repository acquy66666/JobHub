"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { billingApi, CreditPackage, JobTier, TIER_META, formatVnd } from "@/lib/api/billing";
import { CheckoutModal } from "@/components/billing/CheckoutModal";

const TIER_TAGLINE: Record<JobTier, string> = {
  BASIC: "Đăng tin thường · hạn 30 ngày",
  PREMIUM: "Badge Nổi bật · top trang list · 45 ngày",
  VIP: "Badge VIP · trang chủ Việc làm VIP · 60 ngày",
};

export default function ShopPage() {
  const params = useSearchParams();
  const required = params.get("required") as JobTier | null;

  const { data: packages, isLoading } = useQuery<CreditPackage[]>({
    queryKey: ["billing", "packages"],
    queryFn: () => billingApi.getPackages(),
    staleTime: 60_000,
  });

  const [selected, setSelected] = useState<CreditPackage | null>(null);

  const grouped = useMemo(() => {
    const map: Record<JobTier, CreditPackage[]> = { BASIC: [], PREMIUM: [], VIP: [] };
    (packages ?? []).filter((p) => p.isActive).forEach((p) => map[p.tier]?.push(p));
    return map;
  }, [packages]);

  useEffect(() => {
    if (required) {
      const el = document.getElementById(`tier-${required}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [required]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      <div>
        <Link href="/employer/billing" className="text-[12px] text-t2 hover:text-t0">
          ← Quay lại
        </Link>
        <h1 className="text-[24px] sm:text-[28px] font-bold text-t0 mt-2">🛒 Mua credits</h1>
        <p className="text-[13px] text-t1 mt-1">
          Chọn gói phù hợp với nhu cầu tuyển dụng. Mỗi tier có hiệu ứng + thời hạn boost riêng.
        </p>
        {required && (
          <p className="mt-3 px-3 py-2 rounded-lg bg-[rgba(245,158,11,.1)] border border-yellow-500/30 text-[12px] text-yellow-300 inline-block">
            ⚠️ Bạn cần credits <strong>{required}</strong> để đăng tin.
          </p>
        )}
      </div>

      {isLoading ? (
        <p className="text-center text-t2 py-12">Đang tải gói…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(["BASIC", "PREMIUM", "VIP"] as JobTier[]).map((tier) => {
            const meta = TIER_META[tier];
            const list = grouped[tier];
            const highlight = required === tier;
            return (
              <div
                key={tier}
                id={`tier-${tier}`}
                className={`rounded-2xl border bg-gradient-to-br ${meta.gradient} p-5 space-y-4 ${
                  highlight ? "ring-2 ring-yellow-500/50" : meta.ring
                }`}
              >
                <div>
                  <p className={`text-[11px] uppercase tracking-wider ${meta.text}`}>{meta.label}</p>
                  <h2 className="text-[20px] font-bold text-t0 mt-0.5">{meta.label} Credits</h2>
                  <p className="text-[12px] text-t1 mt-1">{TIER_TAGLINE[tier]}</p>
                </div>
                <div className="space-y-3">
                  {list.length === 0 && (
                    <p className="text-[12px] text-t2 italic">Chưa có gói khả dụng.</p>
                  )}
                  {list.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-4 rounded-xl bg-bg-1 border border-border-dark"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-[14px] font-bold text-t0">{pkg.name}</p>
                          <p className="text-[11px] text-t1">
                            {pkg.creditAmount} credits
                            {pkg.bonusCredits > 0 ? (
                              <span className="text-green-400"> +{pkg.bonusCredits} bonus</span>
                            ) : null}
                          </p>
                        </div>
                        {pkg.bonusCredits > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-green-500/15 text-green-300 text-[10px] font-bold">
                            TIẾT KIỆM
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[18px] font-black text-t0">{formatVnd(pkg.priceVnd)}</p>
                        <button
                          onClick={() => setSelected(pkg)}
                          className="px-4 py-2 rounded-lg bg-brand-gradient text-white text-[12px] font-bold"
                        >
                          Mua
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CheckoutModal pkg={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
