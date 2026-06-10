"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { MonoNumber } from "@/components/ui/MonoNumber";
import { billingApi, CreditPackage, JobTier, formatVnd } from "@/lib/api/billing";
import { CheckoutModal } from "@/components/billing/CheckoutModal";

const TIER_TAGLINE: Record<JobTier, string> = {
  BASIC: "đăng tin thường · hạn 30 ngày",
  PREMIUM: "badge nổi bật · top trang list · 45 ngày",
  VIP: "badge VIP · trang chủ việc làm VIP · 60 ngày",
};

const TIER_LABEL: Record<JobTier, string> = {
  BASIC: "basic",
  PREMIUM: "premium",
  VIP: "vip",
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
    <div className="pb-10">
      <section className="px-4 md:px-6 py-8">
        <Link href="/employer/billing" className="font-mono text-[12px] text-[var(--t2)] hover:text-[var(--t0)]">
          ← quay lại
        </Link>
        <h1 className="text-[clamp(26px,3.5vw,36px)] font-medium tracking-tight text-[var(--t0)] mt-3">Mua credits</h1>
        <p className="font-mono text-[13px] text-[var(--t1)] mt-2">{`> chọn gói phù hợp · mỗi tier có hiệu ứng + thời hạn boost riêng`}</p>
        {required && (
          <p className="font-mono text-[12px] text-[var(--accent)] mt-3">
            {`! cần credits ${TIER_LABEL[required]} để đăng tin`}
          </p>
        )}
      </section>

      {isLoading ? (
        <p className="px-4 md:px-6 py-12 font-mono text-[12px] text-[var(--t2)] text-center">đang tải gói…</p>
      ) : (
        (["BASIC", "PREMIUM", "VIP"] as JobTier[]).map((tier) => {
          const list = grouped[tier];
          const highlight = required === tier;
          return (
            <HairlineSection
              key={tier}
              label={`${TIER_LABEL[tier].toUpperCase()} ${highlight ? "· CẦN MUA" : ""}`}
              meta={<span className="font-mono">{TIER_TAGLINE[tier]}</span>}
            >
              <div id={`tier-${tier}`}>
                {list.length === 0 && (
                  <p className="px-4 md:px-6 py-6 font-mono text-[12px] text-[var(--t2)] italic">chưa có gói khả dụng.</p>
                )}
                <ul className="divide-y divide-[var(--border)]">
                  {list.map((pkg, i) => (
                    <li
                      key={pkg.id}
                      className={`grid grid-cols-[48px_1fr_auto_auto] gap-4 items-center px-4 md:px-6 py-4 ${
                        highlight ? "bg-[var(--accent-dim)]" : ""
                      }`}
                    >
                      <MonoNumber size="md" tone="muted">{String(i + 1).padStart(2, "0")}</MonoNumber>
                      <div className="min-w-0">
                        <p className="text-[14px] text-[var(--t0)]">{pkg.name}</p>
                        <p className="font-mono text-[11px] text-[var(--t1)] mt-1">
                          {pkg.creditAmount} credits
                          {pkg.bonusCredits > 0 && (
                            <span className="text-[var(--green)]"> +{pkg.bonusCredits} bonus</span>
                          )}
                        </p>
                      </div>
                      <p className="font-mono tabular-nums text-[14px] text-[var(--t0)] whitespace-nowrap">{formatVnd(pkg.priceVnd)}</p>
                      <button
                        onClick={() => setSelected(pkg)}
                        className="font-mono text-[12px] border border-[var(--accent)] text-[var(--accent)] rounded-sharp px-3 py-1.5 hover:bg-[var(--accent-dim)] transition-colors"
                      >
                        mua
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </HairlineSection>
          );
        })
      )}

      <CheckoutModal pkg={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
