"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { formatJobStatus, formatApplicationStatus, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import Link from "next/link";

interface JobStat {
  id: string;
  title: string;
  status: string;
  applicationCount: number;
  createdAt: string;
}

interface StatsData {
  jobs: JobStat[];
  summary: {
    totalJobs: number;
    activeJobs: number;
    totalViews: number;
    totalApplications: number;
    avgConversionRate: number;
  };
}

interface EmployerProfile {
  companyName: string;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  companySize: string | null;
  description: string | null;
  location: string | null;
}

interface RecentApplication {
  id: string;
  status: string;
  appliedAt: string;
  job: { id: string; title: string };
  candidate: { fullName: string; avatarUrl: string | null; headline: string | null };
}

export default function EmployerDashboard() {
  const { data: profile } = useQuery<EmployerProfile>({
    queryKey: queryKeys.employerProfile(),
    queryFn: () => api.get("/employer/profile").then((r) => r.data),
  });

  const { data: statsData, isLoading: statsLoading } = useQuery<StatsData>({
    queryKey: queryKeys.employerJobStats(),
    queryFn: () => api.get("/employer/job-stats").then((r) => r.data),
  });

  const { data: recentApps = [] } = useQuery<RecentApplication[]>({
    queryKey: queryKeys.employerRecentApplications("PENDING", 5),
    queryFn: () => api.get("/employer/recent-applications", { params: { status: "PENDING", limit: 5 } }).then((r) => r.data),
    staleTime: 30_000,
  });

  const jobs = statsData?.jobs ?? [];
  const summary = statsData?.summary;

  const completionItems = profile ? [
    { label: "Logo công ty", done: !!profile.logoUrl, href: "/employer/profile" },
    { label: "Website", done: !!profile.website, href: "/employer/profile" },
    { label: "Ngành nghề", done: !!profile.industry, href: "/employer/profile" },
    { label: "Quy mô công ty", done: !!profile.companySize, href: "/employer/profile" },
    { label: "Mô tả công ty", done: !!profile.description, href: "/employer/profile" },
    { label: "Địa điểm", done: !!profile.location, href: "/employer/profile" },
  ] : [];
  const completionPct = completionItems.length > 0
    ? Math.round(completionItems.filter((i) => i.done).length / completionItems.length * 100)
    : 0;

  const stats = [
    { label: "Tổng tin đăng", value: summary?.totalJobs ?? "—", icon: "📋", href: "/employer/jobs", color: "from-purple-500/20 to-purple-600/10 border-purple-500/20" },
    { label: "Đang tuyển", value: summary?.activeJobs ?? "—", icon: "✅", href: "/employer/jobs", color: "from-green-500/20 to-green-600/10 border-green-500/20" },
    { label: "Tổng đơn", value: summary?.totalApplications ?? "—", icon: "👥", href: "/employer/jobs", color: "from-blue-500/20 to-blue-600/10 border-blue-500/20" },
    { label: "Lượt xem", value: summary?.totalViews ?? "—", icon: "👁", href: "/employer/stats", color: "from-orange-500/20 to-orange-600/10 border-orange-500/20" },
  ];

  const companyInitial = profile?.companyName?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-8">
      {/* HERO */}
      <ScrollReveal direction="up">
        <div className="relative overflow-hidden bg-bg-2 border border-border-dark rounded-2xl p-6 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,.12),transparent_60%)]" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-bg-3 border border-border-dark flex items-center justify-center shrink-0 overflow-hidden">
                {profile?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[22px] font-black gradient-text">{companyInitial}</span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-[clamp(22px,3vw,30px)] font-extrabold text-t0 tracking-tight truncate">
                  <span className="gradient-text">{profile?.companyName ?? "Công ty của bạn"}</span>
                </h1>
                <p className="text-[13px] text-t1 mt-0.5">Bảng điều khiển nhà tuyển dụng</p>
              </div>
            </div>

            <p className="text-[14px] text-t1 mb-5">
              {completionPct === 100
                ? "Hồ sơ công ty đã hoàn chỉnh. Tin đăng của bạn sẽ thu hút ứng viên hơn!"
                : `Hồ sơ công ty hoàn thiện ${completionPct}% — Hoàn thiện để tăng uy tín với ứng viên.`}
            </p>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-medium text-t2">Độ hoàn thiện hồ sơ</span>
                <span className="text-[12px] font-bold text-[#7C3AED]">{completionPct}%</span>
              </div>
              <div className="h-2 bg-bg-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gradient rounded-full transition-all duration-700"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/employer/jobs/new" className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold">
                Đăng tin mới →
              </Link>
              <Link href="/employer/jobs" className="px-4 py-2 rounded-xl border border-border-dark text-[13px] font-medium text-t1 hover:text-t0 hover:bg-white/[.05] transition-colors">
                Quản lý tin
              </Link>
              <Link href="/employer/profile" className="px-4 py-2 rounded-xl border border-border-dark text-[13px] font-medium text-t1 hover:text-t0 hover:bg-white/[.05] transition-colors">
                Sửa hồ sơ công ty
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* KEY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <ScrollReveal key={stat.label} direction="up" delay={i * 0.06}>
            <Link href={stat.href} className={`block bg-gradient-to-br ${stat.color} border rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-200`}>
              <span className="text-2xl">{stat.icon}</span>
              {statsLoading ? (
                <div className="h-8 w-16 bg-bg-3 rounded-lg animate-pulse mt-2" />
              ) : (
                <p className="text-[26px] font-extrabold text-t0 mt-2 leading-none">{stat.value}</p>
              )}
              <p className="text-[12px] text-t2 mt-1">{stat.label}</p>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      {/* 2-COL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* ĐƠN MỚI GẦN ĐÂY */}
        <ScrollReveal direction="up" delay={0.05}>
          <div className="bg-bg-2 border border-border-dark rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark">
              <h3 className="text-[14px] font-bold text-t0">Đơn mới gần đây</h3>
              <Link href="/employer/jobs" className="text-[12px] text-[#7C3AED] hover:underline">Xem tất cả →</Link>
            </div>
            {recentApps.length === 0 ? (
              <div className="py-10 text-center px-5">
                <p className="text-[13px] text-t2">Chưa có đơn ứng tuyển mới chờ duyệt.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-dark">
                {recentApps.map((app) => {
                  const { label, color } = formatApplicationStatus(app.status);
                  const initial = app.candidate.fullName?.[0]?.toUpperCase() ?? "?";
                  return (
                    <Link
                      key={app.id}
                      href={`/employer/jobs/${app.job.id}/applications`}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[.02] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-bg-3 border border-border-dark flex items-center justify-center shrink-0 overflow-hidden">
                        {app.candidate.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={app.candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[13px] font-black gradient-text">{initial}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-t0 truncate">{app.candidate.fullName}</p>
                        <p className="text-[11px] text-t2 truncate">
                          {app.job.title} · {timeAgo(app.appliedAt)}
                        </p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-lg border ${color}`}>{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* HOÀN THIỆN HỒ SƠ */}
        <ScrollReveal direction="right" delay={0.05}>
          <div className="bg-bg-2 border border-border-dark rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-dark">
              <h3 className="text-[14px] font-bold text-t0">Hoàn thiện hồ sơ</h3>
              <p className="text-[11px] text-t2 mt-0.5">{completionPct}% đã hoàn thành</p>
            </div>
            <div className="p-5 space-y-2">
              {completionItems.map((item) => (
                <Link key={item.label} href={item.href} className="flex items-center gap-2.5 group">
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    item.done
                      ? "bg-green-500/20 border-green-500/40 text-green-400"
                      : "border-border-dark group-hover:border-[rgba(124,58,237,.4)]"
                  }`}>
                    {item.done && (
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                      </svg>
                    )}
                  </span>
                  <span className={`text-[12px] font-medium transition-colors ${
                    item.done ? "text-t2 line-through" : "text-t1 group-hover:text-t0"
                  }`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* TIN TUYỂN DỤNG GẦN ĐÂY */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="bg-bg-2 border border-border-dark rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark">
            <h3 className="text-[14px] font-bold text-t0">Tin tuyển dụng gần đây</h3>
            <Link href="/employer/jobs" className="text-[12px] text-[#7C3AED] hover:underline">Xem tất cả →</Link>
          </div>
          {statsLoading ? (
            <div className="divide-y divide-border-dark">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 bg-bg-3 rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-bg-3 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-20 bg-bg-3 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[14px] text-t2 mb-3">Bạn chưa đăng tin tuyển dụng nào.</p>
              <Link href="/employer/jobs/new" className="inline-block btn-primary px-5 py-2 rounded-xl text-[13px]">Đăng tin đầu tiên</Link>
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {jobs.slice(0, 5).map((job) => {
                const { label, color } = formatJobStatus(job.status);
                return (
                  <Link
                    key={job.id}
                    href={`/employer/jobs/${job.id}/applications`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[.02] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-t0 truncate">{job.title}</p>
                      <p className="text-[11px] text-t2">{job.applicationCount} đơn · {timeAgo(job.createdAt)}</p>
                    </div>
                    <span className={`shrink-0 ml-3 text-[11px] font-medium px-2.5 py-1 rounded-lg border ${color}`}>{label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
