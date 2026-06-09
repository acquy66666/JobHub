"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { TabBar, type Tab } from "@/components/ui/TabBar";
import { useAuthStore } from "@/store/authStore";

const TABS: Tab[] = [
  { href: "/candidate/dashboard", label: "Tổng quan" },
  { href: "/candidate/applications", label: "Đơn ứng tuyển" },
  { href: "/candidate/saved-jobs", label: "Việc đã lưu" },
  { href: "/candidate/recommended", label: "Phù hợp" },
  { href: "/candidate/profile", label: "Hồ sơ" },
  { href: "/candidate/cv", label: "CV" },
  { href: "/candidate/notifications", label: "Thông báo" },
];

const SUB_LABELS: Record<string, string> = {
  "/candidate/dashboard": "dashboard",
  "/candidate/applications": "applications",
  "/candidate/saved-jobs": "saved-jobs",
  "/candidate/recommended": "recommended",
  "/candidate/profile": "profile",
  "/candidate/notifications": "notifications",
  "/candidate/recently-viewed": "recently-viewed",
  "/candidate/compare": "compare",
  "/candidate/followed-companies": "followed-companies",
  "/candidate/job-alerts": "job-alerts",
  "/candidate/cv": "cv",
  "/candidate/preview": "preview",
  "/candidate/onboarding": "onboarding",
  "/candidate/skills/propose": "skills/propose",
};

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const activeTab =
    TABS.map((t) => t.href)
      .sort((a, b) => b.length - a.length)
      .find((href) => pathname === href || pathname.startsWith(href + "/")) ?? "";

  const subLabel =
    Object.keys(SUB_LABELS)
      .sort((a, b) => b.length - a.length)
      .find((k) => pathname === k || pathname.startsWith(k + "/"));
  const crumbLabel = subLabel ? SUB_LABELS[subLabel] : "—";

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-[var(--bg-0)]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-4 gap-3 flex-wrap">
            <Breadcrumb
              items={[
                { label: "~", href: "/" },
                { label: "candidate", href: "/candidate/dashboard" },
                { label: crumbLabel },
              ]}
            />
            {user?.email && (
              <span className="font-mono text-[12px] text-[var(--t2)] truncate">
                {user.email}
              </span>
            )}
          </div>
          <TabBar tabs={TABS} activeHref={activeTab} className="-mx-4 md:mx-0 px-4 md:px-0" />
        </div>
        <main className="max-w-[1280px] mx-auto">{children}</main>
      </div>
    </>
  );
}
