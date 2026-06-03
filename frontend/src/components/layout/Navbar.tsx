"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAuth();
    router.push("/");
  }

  const avatarLetter = user?.profile?.fullName?.[0] ?? user?.profile?.companyName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U";
  const displayName = user?.profile?.fullName ?? user?.profile?.companyName ?? user?.email ?? "";
  const dashboardHref = user?.role === "EMPLOYER" ? "/employer" : user?.role === "ADMIN" ? "/admin" : "/candidate";

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-[999] px-6 backdrop-blur-2xl border-b border-[rgba(37,37,56,.7)] transition-all duration-300 ${
        scrolled ? "bg-[rgba(7,7,13,.96)] shadow-[0_4px_40px_rgba(0,0,0,.5)]" : "bg-[rgba(7,7,13,.8)]"
      }`}
    >
      <div className="max-w-wrap mx-auto h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-[10px] no-underline">
          <div className="w-9 h-9 bg-brand-gradient rounded-[10px] flex items-center justify-center font-black text-[17px] text-white shadow-[0_0_22px_rgba(124,58,237,.45)] shrink-0">
            J
          </div>
          <span className="text-[20px] font-extrabold tracking-[-0.02em] text-t0">JobHub</span>
        </Link>

        {/* Nav links desktop */}
        <div className="hidden md:flex items-center gap-7">
          <Link href="/jobs" className="text-[14px] text-t1 hover:text-t0 transition-colors">Việc làm</Link>
          <Link href="/companies" className="text-[14px] text-t1 hover:text-t0 transition-colors">Công ty</Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center text-[14px] font-semibold text-t1 hover:text-t0 transition-colors px-4 py-2 rounded-[10px] border border-border-dark hover:bg-white/[.06] hover:border-white/[.14]"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="btn-primary inline-flex items-center text-[14px] px-[18px] py-[9px] rounded-[10px]"
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <>
            <NotificationBell />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border-dark hover:bg-white/[.05] transition-colors"
              >
                {user.profile?.avatarUrl || user.profile?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profile.avatarUrl ?? user.profile.logoUrl ?? ""}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-[12px] font-bold text-white">
                    {avatarLetter}
                  </div>
                )}
                <span className="hidden sm:block text-[13px] font-medium text-t0 max-w-[120px] truncate">{displayName}</span>
                <svg className="w-4 h-4 text-t2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-bg-2 border border-border-dark rounded-xl shadow-[0_8px_40px_rgba(0,0,0,.5)] overflow-hidden">
                  <Link
                    href={dashboardHref}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-[13px] text-t0 hover:bg-white/[.05] transition-colors"
                  >
                    Dashboard
                  </Link>
                  {user.role === "CANDIDATE" && (
                    <>
                      <Link href="/candidate/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 text-[13px] text-t1 hover:bg-white/[.05] hover:text-t0 transition-colors">
                        Hồ sơ cá nhân
                      </Link>
                      <Link href="/candidate/applications" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 text-[13px] text-t1 hover:bg-white/[.05] hover:text-t0 transition-colors">
                        Đơn ứng tuyển
                      </Link>
                    </>
                  )}
                  {user.role === "EMPLOYER" && (
                    <>
                      <Link href="/employer/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 text-[13px] text-t1 hover:bg-white/[.05] hover:text-t0 transition-colors">
                        Hồ sơ công ty
                      </Link>
                      <Link href="/employer/jobs" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 text-[13px] text-t1 hover:bg-white/[.05] hover:text-t0 transition-colors">
                        Quản lý tin đăng
                      </Link>
                    </>
                  )}
                  <div className="border-t border-border-dark" />
                  <button
                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-[13px] text-red-400 hover:bg-white/[.05] transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-t1 hover:text-t0 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border-dark py-4 flex flex-col gap-2">
          <Link href="/jobs" onClick={() => setMobileOpen(false)} className="px-4 py-2 text-[14px] text-t1 hover:text-t0 transition-colors">Việc làm</Link>
          <Link href="/companies" onClick={() => setMobileOpen(false)} className="px-4 py-2 text-[14px] text-t1 hover:text-t0 transition-colors">Công ty</Link>
          {!user ? (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="px-4 py-2 text-[14px] text-t1 hover:text-t0 transition-colors">Đăng nhập</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="mx-4 btn-primary text-center text-[14px] py-2 rounded-[10px]">Đăng ký</Link>
            </>
          ) : (
            <>
              <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="px-4 py-2 text-[14px] text-t0 transition-colors">Dashboard</Link>
              <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="mx-4 text-left px-0 py-2 text-[14px] text-red-400">Đăng xuất</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
