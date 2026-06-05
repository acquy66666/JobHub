"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Navbar } from "@/components/layout/Navbar";

const NAV_GROUPS = [
  {
    label: "HOẠT ĐỘNG",
    items: [
      { href: "/candidate", label: "Tổng quan", icon: "⊞" },
      { href: "/candidate/applications", label: "Đơn ứng tuyển", icon: "📋" },
      { href: "/candidate/saved-jobs", label: "Việc đã lưu", icon: "🔖" },
      { href: "/candidate/recently-viewed", label: "Đã xem gần đây", icon: "👁" },
    ],
  },
  {
    label: "HỒ SƠ",
    items: [
      { href: "/candidate/profile", label: "Hồ sơ cá nhân", icon: "👤" },
      { href: "/candidate/cv", label: "CV của tôi", icon: "📄" },
      { href: "/candidate/cv/builder", label: "Tạo CV từ mẫu", icon: "✨" },
      { href: "/candidate/preview", label: "Xem hồ sơ public", icon: "🔗" },
    ],
  },
  {
    label: "KHÁM PHÁ",
    items: [
      { href: "/candidate/recommended", label: "Việc làm phù hợp", icon: "✨" },
      { href: "/candidate/compare", label: "So sánh việc làm", icon: "⚖" },
      { href: "/candidate/followed-companies", label: "Công ty theo dõi", icon: "🏢" },
    ],
  },
  {
    label: "CÀI ĐẶT",
    items: [
      { href: "/candidate/job-alerts", label: "Thông báo việc làm", icon: "🔔" },
    ],
  },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const avatarLetter = user?.profile?.fullName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "C";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItemsFlat = NAV_GROUPS.flatMap((g) => g.items);
  const currentLabel =
    navItemsFlat.find((i) => i.href === pathname)?.label ??
    navItemsFlat
      .filter((i) => i.href !== "/candidate")
      .sort((a, b) => b.href.length - a.href.length)
      .find((i) => pathname.startsWith(i.href))?.label ??
    "Ứng viên";

  const sidebarInner = (
    <>
      <div className="p-5 border-b border-border-dark">
        <div className="flex items-center gap-3">
          {user?.profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profile.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-[14px] font-bold text-white shrink-0">
              {avatarLetter}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-t0 truncate">{user?.profile?.fullName ?? "Ứng viên"}</p>
            <p className="text-[11px] text-t2 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 py-1 text-[10px] font-semibold tracking-widest text-[#55556A] uppercase">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                      active
                        ? "bg-[rgba(124,58,237,.12)] border-l-2 border-primary text-t0 pl-[10px]"
                        : "text-t1 hover:bg-white/[.04] hover:text-t0"
                    }`}
                  >
                    <span className="text-[15px]">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
    <Navbar />
    <div className="min-h-screen flex pt-16">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-[240px] bg-bg-1 border-r border-border-dark flex-col z-50 overflow-y-auto">
        {sidebarInner}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`md:hidden fixed left-0 top-16 bottom-0 w-[240px] bg-bg-1 border-r border-border-dark flex flex-col z-50 overflow-y-auto transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarInner}
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 md:ml-[240px] bg-bg-0 min-h-[calc(100vh-64px)]">
        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border-dark">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-2 rounded-lg text-t1 hover:text-t0 hover:bg-white/[.06] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-[13px] font-semibold text-t0">{currentLabel}</span>
        </div>
        {children}
      </main>
    </div>
    </>
  );
}
