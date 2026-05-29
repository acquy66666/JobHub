"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { formatApplicationStatus, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import Link from "next/link";

export default function CandidateDashboard() {
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

  const completionItems = profile ? [
    { label: "Họ và tên", done: !!profile.fullName, href: "/candidate/profile" },
    { label: "Số điện thoại", done: !!profile.phone, href: "/candidate/profile" },
    { label: "Tiêu đề nghề nghiệp", done: !!profile.headline, href: "/candidate/profile" },
    { label: "Kỹ năng", done: (profile.skills?.length ?? 0) > 0, href: "/candidate/profile" },
    { label: "CV", done: !!profile.cvUrl, href: "/candidate/cv" },
    { label: "Kinh nghiệm làm việc", done: (profile.experiences?.length ?? 0) > 0, href: "/candidate/profile" },
    { label: "Học vấn", done: (profile.educations?.length ?? 0) > 0, href: "/candidate/profile" },
  ] : [];
  const completionPct = completionItems.length > 0 ? Math.round(completionItems.filter(i => i.done).length / completionItems.length * 100) : 0;
  const missingItems = completionItems.filter(i => !i.done);

  const stats = [
    { label: "Đơn ứng tuyển", value: appsData?.total ?? "—", icon: "📋", href: "/candidate/applications" },
    { label: "Việc đã lưu", value: savedData?.total ?? "—", icon: "🔖", href: "/candidate/saved-jobs" },
    { label: "Hồ sơ hoàn thiện", value: `${completionPct}%`, icon: "👤", href: "/candidate/profile" },
    { label: "CV", value: profile?.cvUrl ? "Đã tải" : "Chưa có", icon: "📄", href: "/candidate/cv" },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <ScrollReveal direction="up" className="mb-8">
        <h1 className="text-[28px] font-extrabold text-t0 tracking-tight">
          Xin chào, <span className="gradient-text">{profile?.fullName ?? "bạn"}</span> 👋
        </h1>
        <p className="text-[15px] text-t1 mt-1">Đây là tổng quan hoạt động của bạn trên JobHub.</p>
      </ScrollReveal>

      {/* Stat cards */}
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

      {/* Profile completion */}
      {completionPct < 100 && (
        <ScrollReveal direction="up" delay={0.1} className="mb-8">
          <div className="card-dark p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-t0">Hoàn thiện hồ sơ</h3>
              <span className="text-[13px] font-semibold text-primary">{completionPct}%</span>
            </div>
            <div className="h-2 bg-bg-3 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-brand-gradient rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            {missingItems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] text-t2">Còn thiếu:</span>
                {missingItems.map((item) => (
                  <Link key={item.label} href={item.href} className="text-[11px] px-2 py-0.5 rounded-lg bg-bg-3 border border-border-dark text-t1 hover:border-[rgba(124,58,237,.4)] hover:text-primary transition-colors">
                    + {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      )}

      {/* Recent applications */}
      <ScrollReveal direction="up" delay={0.15}>
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border-dark">
            <h3 className="text-[15px] font-bold text-t0">Đơn ứng tuyển gần đây</h3>
            <Link href="/candidate/applications" className="text-[12px] text-primary hover:underline">Xem tất cả →</Link>
          </div>
          {(appsData?.applications ?? []).length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[14px] text-t2">Bạn chưa ứng tuyển vị trí nào.</p>
              <Link href="/jobs" className="inline-block mt-3 btn-primary px-5 py-2 rounded-xl text-[13px]">Tìm việc ngay</Link>
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {(appsData?.applications ?? []).map((app: {
                id: string;
                status: string;
                appliedAt: string;
                job: { title: string; employer: { companyName: string } };
              }) => {
                const { label, color } = formatApplicationStatus(app.status);
                return (
                  <div key={app.id} className="flex items-center justify-between p-4 hover:bg-white/[.02] transition-colors">
                    <div>
                      <p className="text-[14px] font-semibold text-t0">{app.job.title}</p>
                      <p className="text-[12px] text-t2">{app.job.employer.companyName} · {timeAgo(app.appliedAt)}</p>
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${color}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
