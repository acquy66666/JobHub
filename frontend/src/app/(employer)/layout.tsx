"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { TabBar, type Tab } from "@/components/ui/TabBar";
import { billingApi, CreditBalance } from "@/lib/api/billing";

const TABS: Tab[] = [
  { href: "/employer/dashboard", label: "Tổng quan" },
  { href: "/employer/jobs", label: "Tin tuyển dụng" },
  { href: "/employer/applications", label: "Ứng viên" },
  { href: "/employer/candidates", label: "Tìm ứng viên" },
  { href: "/employer/stats", label: "Thống kê" },
  { href: "/employer/profile", label: "Hồ sơ" },
  { href: "/employer/billing", label: "Credits" },
];

const SUB_LABELS: Record<string, string> = {
  "/employer/dashboard": "dashboard",
  "/employer/jobs": "jobs",
  "/employer/jobs/new": "jobs/new",
  "/employer/applications": "applications",
  "/employer/candidates": "candidates",
  "/employer/stats": "stats",
  "/employer/profile": "profile",
  "/employer/billing": "billing",
  "/employer/billing/shop": "billing/shop",
  "/employer/skills/propose": "skills/propose",
};

function CreditInline() {
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
      className="font-mono text-[12px] text-[var(--t1)] hover:text-[var(--t0)] transition-colors"
      title="Credits"
    >
      <span className="text-[var(--t2)]">credits:</span>{" "}
      <span className="tabular-nums">{b}</span>
      <span className="text-[var(--t2)]">·</span>
      <span className="tabular-nums text-[var(--accent)]">{p}</span>
      <span className="text-[var(--t2)]">·</span>
      <span className="tabular-nums text-[var(--green)]">{v}</span>
    </Link>
  );
}

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const activeTab =
    TABS.map((t) => t.href)
      .sort((a, b) => b.length - a.length)
      .find((href) => pathname === href || pathname.startsWith(href + "/")) ?? "";

  // Handle /employer root → dashboard
  const effectiveActive =
    activeTab || (pathname === "/employer" ? "/employer/dashboard" : "");

  const subKey = Object.keys(SUB_LABELS)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname === k || pathname.startsWith(k + "/"));
  const crumbLabel = subKey
    ? SUB_LABELS[subKey]
    : pathname === "/employer"
    ? "dashboard"
    : "—";

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-[var(--bg-0)]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-4 gap-3 flex-wrap">
            <Breadcrumb
              items={[
                { label: "~", href: "/" },
                { label: "employer", href: "/employer/dashboard" },
                { label: crumbLabel },
              ]}
            />
            <div className="flex items-center gap-4">
              <CreditInline />
              {user?.email && (
                <span className="font-mono text-[12px] text-[var(--t2)] truncate hidden sm:inline">
                  {user.email}
                </span>
              )}
            </div>
          </div>
          <TabBar
            tabs={TABS}
            activeHref={effectiveActive}
            className="-mx-4 md:mx-0 px-4 md:px-0"
          />
        </div>
        <main className="max-w-[1280px] mx-auto">{children}</main>
      </div>
    </>
  );
}
