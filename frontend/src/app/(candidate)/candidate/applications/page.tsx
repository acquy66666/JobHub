"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import { formatApplicationStatus, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  coverLetter?: string;
  note?: string;
  cvUrl: string;
  job: {
    id: string;
    title: string;
    location: string;
    employer: { companyName: string; logoUrl?: string };
  };
}

export default function CandidateApplicationsPage() {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.candidateApplications(page),
    queryFn: () => api.get("/candidate/applications", { params: { page, limit: 10 } }).then((r) => r.data),
  });

  const applications: Application[] = data?.applications ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <ScrollReveal direction="up">
        <h1 className="text-[24px] font-extrabold text-t0 mb-1">Đơn ứng tuyển</h1>
        <p className="text-[14px] text-t1">Theo dõi trạng thái các đơn ứng tuyển của bạn.</p>
      </ScrollReveal>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-bg-2 rounded-2xl animate-pulse" />)}
        </div>
      ) : applications.length === 0 ? (
        <ScrollReveal direction="up" delay={0.05}>
          <div className="card-dark p-12 rounded-2xl text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-[18px] font-bold text-t0 mb-2">Chưa có đơn ứng tuyển</h3>
            <p className="text-[14px] text-t1 mb-4">Bắt đầu tìm kiếm và ứng tuyển ngay hôm nay!</p>
          </div>
        </ScrollReveal>
      ) : (
        <div className="space-y-3">
          {applications.map((app, i) => {
            const { label, color } = formatApplicationStatus(app.status);
            const isExpanded = expanded === app.id;
            const initial = app.job.employer.companyName?.[0]?.toUpperCase() ?? "?";
            return (
              <ScrollReveal key={app.id} direction="up" delay={i * 0.05}>
                <div className="card-dark rounded-2xl overflow-hidden">
                  <button
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[.02] transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : app.id)}
                  >
                    <div className="w-11 h-11 rounded-xl bg-bg-3 flex items-center justify-center shrink-0">
                      {app.job.employer.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={app.job.employer.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span className="text-[16px] font-black gradient-text">{initial}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-t0 truncate">{app.job.title}</p>
                      <p className="text-[12px] text-t2">{app.job.employer.companyName} · {app.job.location} · {timeAgo(app.appliedAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${color}`}>{label}</span>
                      <svg className={`w-4 h-4 text-t2 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border-dark p-5 space-y-3 bg-bg-1/50">
                      <div className="flex gap-3">
                        <a href={app.cvUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border border-border-dark text-[12px] text-t1 hover:bg-white/[.04] hover:text-t0 transition-colors">
                          📄 Xem CV đã nộp
                        </a>
                      </div>
                      {app.coverLetter && (
                        <div>
                          <p className="text-[12px] font-semibold text-t2 uppercase tracking-wide mb-1.5">Thư giới thiệu</p>
                          <p className="text-[13px] text-t1 leading-relaxed">{app.coverLetter}</p>
                        </div>
                      )}
                      {app.note && (
                        <div>
                          <p className="text-[12px] font-semibold text-t2 uppercase tracking-wide mb-1.5">Ghi chú từ nhà tuyển dụng</p>
                          <p className="text-[13px] text-t1 leading-relaxed">{app.note}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
