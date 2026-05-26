"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Tổng quan", icon: "⊞" },
  { href: "/admin/jobs", label: "Duyệt tin", icon: "📋" },
  { href: "/admin/users", label: "Quản lý users", icon: "👥" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex pt-16">
      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-[240px] bg-bg-1 border-r border-border-dark flex flex-col z-50 overflow-y-auto">
        {/* Header */}
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

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
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
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-[240px] bg-bg-0 min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}
