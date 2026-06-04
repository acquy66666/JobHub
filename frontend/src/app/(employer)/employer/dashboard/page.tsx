"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { formatJobStatus, timeAgo } from "@/lib/formatters";
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

export default function EmployerDashboard() {
  const { data, isLoading } = useQuery<StatsData>({
    queryKey: queryKeys.employerJobStats(),
    queryFn: () => api.get("/employer/job-stats").then((r) => r.data),
  });

  const jobs = data?.jobs ?? [];
  const summary = data?.summary;

  const stats = [
    { label: "Tổng tin đăng", value: summary?.totalJobs ?? 0, icon: "📋", href: "/employer/jobs" },
    { label: "Tin đang tuyển", value: summary?.activeJobs ?? 0, icon: "✅", href: "/employer/jobs" },
    { label: "Tổng đơn nhận", value: summary?.totalApplications ?? 0, icon: "👥", href: "/employer/jobs" },
    { label: "Đăng tin mới", value: "+", icon: "➕", href: "/employer/jobs/new" },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <ScrollReveal direction="up" className="mb-8">
        <h1 className="text-[28px] font-extrabold text-t0 tracking-tight">Dashboard</h1>
        <p className="text-[15px] text-t1 mt-1">Quản lý tin tuyển dụng và ứng viên của bạn.</p>
      </ScrollReveal>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <ScrollReveal key={stat.label} direction="up" delay={i * 0.08}>
            <Link href={stat.href} className="card-dark p-5 rounded-2xl block hover:border-[rgba(124,58,237,.4)] transition-colors">
              <span className="text-2xl">{stat.icon}</span>
              {isLoading && stat.value !== "+" ? (
                <div className="h-8 w-16 bg-bg-3 rounded-lg animate-pulse mt-2" />
              ) : (
                <p className="text-[26px] font-extrabold text-t0 mt-2">{stat.value}</p>
              )}
              <p className="text-[12px] text-t2 mt-0.5">{stat.label}</p>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      {/* Recent jobs */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border-dark">
            <h3 className="text-[15px] font-bold text-t0">Tin tuyển dụng gần đây</h3>
            <Link href="/employer/jobs" className="text-[12px] text-primary hover:underline">Xem tất cả →</Link>
          </div>
          {isLoading ? (
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
              <Link href="/employer/jobs/new" className="btn-primary px-5 py-2 rounded-xl text-[13px]">Đăng tin đầu tiên</Link>
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {jobs.slice(0, 5).map((job) => {
                const { label, color } = formatJobStatus(job.status);
                return (
                  <Link
                    key={job.id}
                    href={`/employer/jobs/${job.id}/applications`}
                    className="flex items-center justify-between p-4 hover:bg-white/[.02] transition-colors"
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-t0">{job.title}</p>
                      <p className="text-[12px] text-t2">{job.applicationCount} đơn · {timeAgo(job.createdAt)}</p>
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${color}`}>{label}</span>
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
