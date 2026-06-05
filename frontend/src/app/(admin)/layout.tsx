"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Tổng quan", icon: "⊞" },
  { href: "/admin/jobs", label: "Duyệt tin", icon: "📋" },
  { href: "/admin/users", label: "Quản lý users", icon: "👥" },
  { href: "/admin/reports", label: "Báo cáo vi phạm", icon: "⚑" },
  { href: "/admin/logs", label: "Audit Logs", icon: "📜" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentLabel =
    NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(i.href + "/"))?.label ?? "Admin Panel";

  const sidebarInner = (
    <>
      <div className="p-5 border-b border-border-dark">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-[14px] font-bold text-white shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-t0 truncate">Admin Panel</p>
            <p className="text-[11px] text-t2">Quản trị hệ thống</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
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
              <span className="text-[16px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
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
