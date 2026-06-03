"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { formatApplicationStatus, formatJobType, formatWorkMode, formatSalary, timeAgo } from "@/lib/formatters";
import { getRecentlyViewed, RecentlyViewedJob } from "@/lib/recentlyViewed";
import api from "@/lib/api";
import Link from "next/link";

const NOTIF_TYPE_ICON: Record<string, string> = {
  APPLICATION_STATUS_CHANGED: "📋",
  NEW_JOB_FROM_FOLLOWED_COMPANY: "🏢",
  NEW_MATCHED_JOB: "✨",
  JOB_EXPIRING_SOON: "⏰",
  SYSTEM: "🔔",
};

export default function CandidateDashboard() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedJob[]>([]);

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed().slice(0, 8));
  }, []);

  const { data: profile } = useQuery({
    queryKey: queryKeys.candidateProfile(),
    queryFn: () => api.get("/candidate/profile").then((r) => r.data),
  });

  const { data: appsData } = useQuery({
    queryKey: queryKeys.candidateApplications(1),
    queryFn: () => api.get("/candidate/applications", { params: { page: 1, limit: 5 } }).then((r) => r.data),
  });

  const { data: savedData } = useQuery({
    queryKey: queryKeys.candidateSavedJobs(1),
    queryFn: () => api.get("/candidate/saved-jobs", { params: { page: 1, limit: 1 } }).then((r) => r.data),
  });

  const { data: notifData } = useQuery({
    queryKey: queryKeys.notifications(1),
    queryFn: () => api.get("/notifications?page=1&limit=5").then((r) => r.data),
  });

  const completionItems = profile ? [
    { label: "Họ và tên", done: !!profile.fullName, href: "/candidate/profile" },
    { label: "Số điện thoại", done: !!profile.phone, href: "/candidate/profile" },
    { label: "Tiêu đề nghề nghiệp", done: !!profile.headline, href: "/candidate/profile" },
    { label: "Kỹ năng", done: (profile.skills?.length ?? 0) > 0, href: "/candidate/profile" },
    { label: "CV", done: !!profile.cvUrl, href: "/candidate/cv" },
    { label: "Kinh nghiệm làm việc", done: (profile.experiences?.length ?? 0) > 0, href: "/candidate/profile" },
    { label: "Học vấn", done: (profile.educations?.length ?? 0) > 0, href: "/candidate/profile" },
  ] : [];
  const completionPct = completionItems.length > 0
    ? Math.round(completionItems.filter((i) => i.done).length / completionItems.length * 100)
    : 0;

  const stats = [
    { label: "Đơn ứng tuyển", value: appsData?.total ?? "—", icon: "📋", href: "/candidate/applications", color: "from-purple-500/20 to-purple-600/10 border-purple-500/20" },
    { label: "Việc đã lưu", value: savedData?.total ?? "—", icon: "🔖", href: "/candidate/saved-jobs", color: "from-blue-500/20 to-blue-600/10 border-blue-500/20" },
    { label: "Đã xem gần đây", value: recentlyViewed.length, icon: "👁", href: "/candidate/recently-viewed", color: "from-green-500/20 to-green-600/10 border-green-500/20" },
    { label: "CV", value: profile?.cvUrl ? "Đã có" : "Chưa có", icon: "📄", href: "/candidate/cv", color: "from-orange-500/20 to-orange-600/10 border-orange-500/20" },
  ];

  const notifications = notifData?.notifications ?? [];
  const applications = appsData?.applications ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-8">
      {/* HERO */}
      <ScrollReveal direction="up">
        <div className="relative overflow-hidden bg-bg-2 border border-border-dark rounded-2xl p-6 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,.12),transparent_60%)]" />
          <div className="relative">
            <h1 className="text-[clamp(22px,3vw,30px)] font-extrabold text-t0 tracking-tight">
              Xin chào, <span className="gradient-text">{profile?.fullName ?? "bạn"}</span>! 👋
            </h1>
            <p className="text-[14px] text-t1 mt-1 mb-5">
              {completionPct === 100
                ? "Hồ sơ của bạn đã hoàn chỉnh. Hãy tiếp tục tìm kiếm cơ hội phù hợp!"
                : `Hồ sơ hoàn thiện ${completionPct}% — Hoàn thiện để tăng cơ hội được tuyển dụng.`}
            </p>

            {/* Profile strength bar */}
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

            {/* Quick actions */}
            <div className="flex flex-wrap gap-3">
              <Link href="/jobs" className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold">
                Tìm việc →
              </Link>
              <Link href="/candidate/cv" className="px-4 py-2 rounded-xl border border-border-dark text-[13px] font-medium text-t1 hover:text-t0 hover:bg-white/[.05] transition-colors">
                Upload CV
              </Link>
              <Link href="/candidate/job-alerts" className="px-4 py-2 rounded-xl border border-border-dark text-[13px] font-medium text-t1 hover:text-t0 hover:bg-white/[.05] transition-colors">
                Thông báo việc làm
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
              <p className="text-[26px] font-extrabold text-t0 mt-2 leading-none">{stat.value}</p>
              <p className="text-[12px] text-t2 mt-1">{stat.label}</p>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      {/* 2-COL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* HOẠT ĐỘNG GẦN ĐÂY */}
        <ScrollReveal direction="up" delay={0.05}>
          <div className="bg-bg-2 border border-border-dark rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark">
              <h3 className="text-[14px] font-bold text-t0">Hoạt động gần đây</h3>
              <Link href="/candidate/notifications" className="text-[12px] text-[#7C3AED] hover:underline">Xem tất cả →</Link>
            </div>
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[13px] text-t2">Chưa có hoạt động nào</p>
              </div>
            ) : (
              <div className="divide-y divide-border-dark">
                {notifications.map((noti: { id: string; type: string; title: string; message: string; isRead: boolean; createdAt: string; link?: string | null }) => (
                  <div
                    key={noti.id}
                    className={`flex items-start gap-3 px-5 py-3.5 ${!noti.isRead ? "bg-[rgba(124,58,237,.03)]" : ""}`}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{NOTIF_TYPE_ICON[noti.type] ?? "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-semibold truncate ${!noti.isRead ? "text-t0" : "text-t1"}`}>
                        {noti.title}
                      </p>
                      <p className="text-[11px] text-t2 mt-0.5 line-clamp-1">{noti.message}</p>
                    </div>
                    <span className="text-[10px] text-t2 shrink-0 mt-0.5">{timeAgo(noti.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* PROFILE COMPLETION / MISSING ITEMS */}
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

      {/* ĐƠN ỨNG TUYỂN GẦN ĐÂY */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="bg-bg-2 border border-border-dark rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark">
            <h3 className="text-[14px] font-bold text-t0">Đơn ứng tuyển gần đây</h3>
            <Link href="/candidate/applications" className="text-[12px] text-[#7C3AED] hover:underline">Xem tất cả →</Link>
          </div>
          {applications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[14px] text-t2 mb-3">Bạn chưa ứng tuyển vị trí nào.</p>
              <Link href="/jobs" className="inline-block btn-primary px-5 py-2 rounded-xl text-[13px]">Tìm việc ngay</Link>
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {applications.map((app: {
                id: string;
                status: string;
                appliedAt: string;
                job: { title: string; employer: { companyName: string } };
              }) => {
                const { label, color } = formatApplicationStatus(app.status);
                return (
                  <div key={app.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[.02] transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-t0 truncate">{app.job.title}</p>
                      <p className="text-[11px] text-t2">{app.job.employer.companyName} · {timeAgo(app.appliedAt)}</p>
                    </div>
                    <span className={`shrink-0 ml-3 text-[11px] font-medium px-2.5 py-1 rounded-lg border ${color}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* ĐÃ XEM GẦN ĐÂY - horizontal scroll */}
      {recentlyViewed.length > 0 && (
        <ScrollReveal direction="up" delay={0.12}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold text-t0">Đã xem gần đây</h3>
              <Link href="/candidate/recently-viewed" className="text-[12px] text-[#7C3AED] hover:underline">Xem tất cả →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {recentlyViewed.map((job) => {
                const initial = job.employer.companyName?.[0]?.toUpperCase() ?? "?";
                return (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="shrink-0 w-60 bg-bg-2 border border-border-dark rounded-2xl p-4 hover:border-[rgba(124,58,237,.38)] hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="w-8 h-8 rounded-lg bg-bg-3 flex items-center justify-center shrink-0">
                        {job.employer.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={job.employer.logoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-[13px] font-black gradient-text">{initial}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-t2 truncate">{job.employer.companyName}</p>
                    </div>
                    <p className="text-[13px] font-bold text-t0 line-clamp-2 mb-2 group-hover:text-[#9D5CF6] transition-colors">
                      {job.title}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="badge-type text-[10px]">{formatJobType(job.jobType)}</span>
                      <span className="badge-mode text-[10px]">{formatWorkMode(job.workMode)}</span>
                    </div>
                    <p className="text-[11px] text-green-400 font-medium">
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                    </p>
                    <p className="text-[10px] text-t2 mt-1.5">Xem {timeAgo(job.viewedAt)}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
