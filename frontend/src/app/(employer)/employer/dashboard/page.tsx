"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { formatApplicationStatus, formatJobStatus, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import Link from "next/link";

export default function EmployerDashboard() {
  const { data: jobsData } = useQuery({
    queryKey: queryKeys.employerJobs(1),
    queryFn: () => api.get("/employer/jobs", { params: { page: 1, limit: 100 } }).then((r) => r.data),
  });

  const jobs = jobsData?.jobs ?? [];
  const totalJobs = jobsData?.total ?? 0;
  const activeJobs = jobs.filter((j: { status: string }) => j.status === "ACTIVE").length;
  const totalApplications = jobs.reduce((sum: number, j: { _count: { applications: number } }) => sum + (j._count?.applications ?? 0), 0);

  const stats = [
    { label: "Tổng tin đăng", value: totalJobs, icon: "📋", href: "/employer/jobs" },
    { label: "Tin đang tuyển", value: activeJobs, icon: "✅", href: "/employer/jobs" },
    { label: "Tổng đơn nhận", value: totalApplications, icon: "👥", href: "/employer/jobs" },
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
              <p className="text-[26px] font-extrabold text-t0 mt-2">{stat.value}</p>
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
          {jobs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[14px] text-t2 mb-3">Bạn chưa đăng tin tuyển dụng nào.</p>
              <Link href="/employer/jobs/new" className="btn-primary px-5 py-2 rounded-xl text-[13px]">Đăng tin đầu tiên</Link>
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {jobs.slice(0, 5).map((job: { id: string; title: string; status: string; createdAt: string; _count: { applications: number } }) => {
                const { label, color } = formatJobStatus(job.status);
                return (
                  <Link
                    key={job.id}
                    href={`/employer/jobs/${job.id}/applications`}
                    className="flex items-center justify-between p-4 hover:bg-white/[.02] transition-colors"
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-t0">{job.title}</p>
                      <p className="text-[12px] text-t2">{job._count.applications} đơn · {timeAgo(job.createdAt)}</p>
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${color}`}>{label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </ScrollReveal>

      <div className="mt-4 text-[11px] text-t2 hidden">{formatApplicationStatus("PENDING").label}</div>
    </div>
  );
}
