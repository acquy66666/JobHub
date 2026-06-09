"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { queryKeys } from "@/lib/queryKeys";
import { formatJobStatus, formatApplicationStatus, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { MonoNumber } from "@/components/ui/MonoNumber";

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
    queryFn: () =>
      api.get("/employer/recent-applications", { params: { status: "PENDING", limit: 5 } }).then((r) => r.data),
    staleTime: 30_000,
  });

  const jobs = statsData?.jobs ?? [];
  const summary = statsData?.summary;

  const completionItems = profile
    ? [
        { label: "Logo công ty", done: !!profile.logoUrl },
        { label: "Website", done: !!profile.website },
        { label: "Ngành nghề", done: !!profile.industry },
        { label: "Quy mô công ty", done: !!profile.companySize },
        { label: "Mô tả công ty", done: !!profile.description },
        { label: "Địa điểm", done: !!profile.location },
      ]
    : [];
  const completionPct =
    completionItems.length > 0
      ? Math.round((completionItems.filter((i) => i.done).length / completionItems.length) * 100)
      : 0;

  const stats = [
    { label: "tin đăng", value: summary?.totalJobs, href: "/employer/jobs" },
    { label: "đang tuyển", value: summary?.activeJobs, href: "/employer/jobs" },
    { label: "tổng đơn", value: summary?.totalApplications, href: "/employer/applications" },
    { label: "lượt xem", value: summary?.totalViews, href: "/employer/stats" },
  ];

  return (
    <div className="pb-10">
      <section className="px-4 md:px-6 py-8">
        <h1 className="text-[clamp(26px,3.5vw,36px)] font-medium tracking-tight text-[var(--t0)]">
          Chào, {profile?.companyName ?? "công ty"}.
        </h1>
        <p className="font-mono text-[13px] text-[var(--t1)] mt-2">
          {`> hồ sơ ${completionPct}% · ${summary?.totalJobs ?? "—"} tin · ${summary?.totalApplications ?? "—"} đơn · ${
            summary?.totalViews ?? "—"
          } views`}
          {completionPct < 100 && (
            <>
              {" · "}
              <Link href="/employer/profile" className="text-[var(--accent)] hover:underline">
                hoàn thiện hồ sơ →
              </Link>
            </>
          )}
        </p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-[var(--border)]">
        {stats.map((s, i) => (
          <Link
            key={s.label}
            href={s.href}
            className={`px-4 md:px-6 py-5 border-[var(--border)] hover:bg-[var(--accent-dim)] transition-colors ${
              i < 3 ? "border-r" : ""
            } ${i < 2 ? "border-b md:border-b-0" : ""}`}
          >
            <MonoNumber size="lg" tone="default">
              {statsLoading ? "—" : s.value ?? 0}
            </MonoNumber>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--t2)] mt-2">{s.label}</p>
          </Link>
        ))}
      </div>

      <HairlineSection
        label="ĐƠN MỚI CHỜ DUYỆT"
        meta={
          <Link href="/employer/applications" className="font-mono text-[var(--accent)] hover:underline">
            xem tất cả →
          </Link>
        }
      >
        {recentApps.length === 0 ? (
          <p className="px-4 md:px-6 py-8 font-mono text-[13px] text-[var(--t2)]">
            Chưa có đơn ứng tuyển mới chờ duyệt.
          </p>
        ) : (
          recentApps.map((app, i) => {
            const { label, color } = formatApplicationStatus(app.status);
            return (
              <Link
                key={app.id}
                href={`/employer/jobs/${app.job.id}/applications`}
                className="group grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_auto] items-center gap-4 px-4 md:px-6 min-h-[var(--row-h-compact)] border-b border-[var(--border)] hover:bg-[var(--accent-dim)] transition-colors"
              >
                <MonoNumber size="lg" tone="muted">
                  {String(i + 1).padStart(2, "0")}
                </MonoNumber>
                <div className="min-w-0">
                  <div className="text-[14px] md:text-[15px] font-semibold text-[var(--t0)] truncate group-hover:text-[var(--accent)] transition-colors">
                    {app.candidate.fullName}
                  </div>
                  <div className="font-mono text-[12px] text-[var(--t1)] truncate mt-0.5">
                    {app.job.title} · {timeAgo(app.appliedAt)}
                  </div>
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-sharp border ${color}`}>{label}</span>
              </Link>
            );
          })
        )}
      </HairlineSection>

      <HairlineSection
        label="TIN GẦN ĐÂY"
        meta={
          <Link href="/employer/jobs" className="font-mono text-[var(--accent)] hover:underline">
            xem tất cả →
          </Link>
        }
      >
        {statsLoading ? (
          <p className="px-4 md:px-6 py-8 font-mono text-[13px] text-[var(--t2)]">đang tải…</p>
        ) : jobs.length === 0 ? (
          <div className="px-4 md:px-6 py-8 text-center">
            <p className="font-mono text-[13px] text-[var(--t2)]">Bạn chưa đăng tin tuyển dụng nào.</p>
            <Link
              href="/employer/jobs/new"
              className="inline-block mt-3 font-mono text-[13px] text-[var(--accent)] hover:underline"
            >
              → đăng tin đầu tiên
            </Link>
          </div>
        ) : (
          jobs.slice(0, 5).map((job, i) => {
            const { label, color } = formatJobStatus(job.status);
            return (
              <Link
                key={job.id}
                href={`/employer/jobs/${job.id}/applications`}
                className="group grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_auto] items-center gap-4 px-4 md:px-6 min-h-[var(--row-h-compact)] border-b border-[var(--border)] hover:bg-[var(--accent-dim)] transition-colors"
              >
                <MonoNumber size="lg" tone="muted">
                  {String(i + 1).padStart(2, "0")}
                </MonoNumber>
                <div className="min-w-0">
                  <div className="text-[14px] md:text-[15px] font-semibold text-[var(--t0)] truncate group-hover:text-[var(--accent)] transition-colors">
                    {job.title}
                  </div>
                  <div className="font-mono text-[12px] text-[var(--t1)] truncate mt-0.5">
                    {job.applicationCount} đơn · {timeAgo(job.createdAt)}
                  </div>
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-sharp border ${color}`}>{label}</span>
              </Link>
            );
          })
        )}
      </HairlineSection>

      {completionPct < 100 && (
        <HairlineSection label="HOÀN THIỆN HỒ SƠ" meta={`${completionPct}%`}>
          <ul className="px-4 md:px-6 py-5 space-y-2 font-mono text-[13px]">
            {completionItems.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span className={item.done ? "text-[var(--green)]" : "text-[var(--t2)]"}>
                  {item.done ? "✓" : "○"}
                </span>
                <Link
                  href="/employer/profile"
                  className={`hover:text-[var(--t0)] transition-colors ${
                    item.done ? "text-[var(--t2)] line-through" : "text-[var(--t1)]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </HairlineSection>
      )}
    </div>
  );
}
