"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import { formatApplicationStatus, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";

interface StatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
}

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
    employer: { companyName: string; logoUrl?: string | null };
  };
}

type ViewMode = "list" | "kanban" | "timeline";

const STATUS_ORDER = ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ duyệt",
  REVIEWING: "Đang xem xét",
  ACCEPTED: "Đã chấp nhận",
  REJECTED: "Từ chối",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "border-yellow-500/30 bg-yellow-500/10",
  REVIEWING: "border-blue-500/30 bg-blue-500/10",
  ACCEPTED: "border-green-500/30 bg-green-500/10",
  REJECTED: "border-red-500/30 bg-red-500/10",
};

const STATUS_HEADER_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  REVIEWING: "text-blue-400",
  ACCEPTED: "text-green-400",
  REJECTED: "text-red-400",
};

function TimelineView({ appId }: { appId: string }) {
  const { data: app, isLoading } = useQuery({
    queryKey: queryKeys.applicationTimeline(appId),
    queryFn: () => api.get(`/candidate/applications/${appId}/timeline`).then((r) => r.data),
  });

  if (isLoading) return <div className="py-6 text-center"><div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  const history: StatusHistory[] = app?.statusHistory ?? [];
  if (history.length === 0) {
    return (
      <div className="py-4 px-5 text-center">
        <p className="text-[12px] text-t2">Chưa có lịch sử cập nhật trạng thái.</p>
        <p className="text-[11px] text-t2 mt-1">Trạng thái ban đầu: Chờ duyệt</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border-dark" />
        <div className="space-y-4">
          {history.map((entry) => {
            const { label, color } = formatApplicationStatus(entry.toStatus);
            return (
              <div key={entry.id} className="relative flex gap-4 pl-8">
                <div className="absolute left-0 w-6 h-6 rounded-full bg-bg-2 border-2 border-[#7C3AED] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.fromStatus && (
                      <>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${formatApplicationStatus(entry.fromStatus).color}`}>
                          {formatApplicationStatus(entry.fromStatus).label}
                        </span>
                        <span className="text-[11px] text-t2">→</span>
                      </>
                    )}
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${color}`}>{label}</span>
                  </div>
                  {entry.note && (
                    <p className="text-[12px] text-t1 mt-1">{entry.note}</p>
                  )}
                  <p className="text-[10px] text-t2 mt-0.5">{timeAgo(entry.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ListView({ applications, totalPages, page, setPage }: {
  applications: Application[];
  totalPages: number;
  page: number;
  setPage: (p: number) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <div className="space-y-3">
        {applications.map((app, i) => {
          const { label, color } = formatApplicationStatus(app.status);
          const isExpanded = expanded === app.id;
          const initial = app.job.employer.companyName?.[0]?.toUpperCase() ?? "?";
          return (
            <ScrollReveal key={app.id} direction="up" delay={i * 0.05}>
              <div className="bg-bg-2 border border-border-dark rounded-2xl overflow-hidden">
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
                  <div className="border-t border-border-dark">
                    <div className="p-5 space-y-3 bg-bg-1/50">
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
                    <div className="border-t border-border-dark">
                      <p className="text-[12px] font-semibold text-t2 uppercase tracking-wide px-5 pt-4 pb-2">Lịch sử trạng thái</p>
                      <TimelineView appId={app.id} />
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          );
        })}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}

function KanbanView({ applications }: { applications: Application[] }) {
  const grouped = STATUS_ORDER.reduce<Record<string, Application[]>>((acc, s) => {
    acc[s] = applications.filter(a => a.status === s);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATUS_ORDER.map((status) => {
        const items = grouped[status];
        return (
          <div key={status} className={`rounded-2xl border p-4 ${STATUS_COLORS[status]}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[12px] font-bold ${STATUS_HEADER_COLORS[status]}`}>{STATUS_LABELS[status]}</p>
              <span className="text-[11px] font-bold text-t2 bg-bg-2 px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map(app => {
                const initial = app.job.employer.companyName?.[0]?.toUpperCase() ?? "?";
                return (
                  <div key={app.id} className="bg-bg-2 border border-border-dark rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-lg bg-bg-3 flex items-center justify-center shrink-0 text-[10px] font-black gradient-text overflow-hidden">
                        {app.job.employer.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={app.job.employer.logoUrl} alt="" className="w-full h-full object-cover" />
                        ) : initial}
                      </div>
                      <p className="text-[11px] text-t2 truncate">{app.job.employer.companyName}</p>
                    </div>
                    <p className="text-[12px] font-semibold text-t0 line-clamp-2">{app.job.title}</p>
                    <p className="text-[10px] text-t2 mt-1.5">{timeAgo(app.appliedAt)}</p>
                  </div>
                );
              })}
              {items.length === 0 && (
                <p className="text-[11px] text-t2 text-center py-4">Trống</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CandidateApplicationsPage() {
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ViewMode>("list");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.candidateApplications(page),
    queryFn: () => api.get("/candidate/applications", { params: { page, limit: 10 } }).then((r) => r.data),
  });

  const applications: Application[] = data?.applications ?? [];
  const totalPages = data?.totalPages ?? 1;

  const viewButtons: { key: ViewMode; label: string; icon: string }[] = [
    { key: "list", label: "Danh sách", icon: "☰" },
    { key: "kanban", label: "Kanban", icon: "⊞" },
    { key: "timeline", label: "Timeline", icon: "◎" },
  ];

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <ScrollReveal direction="up">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[24px] font-extrabold text-t0 mb-1">Đơn ứng tuyển</h1>
            <p className="text-[14px] text-t1">Theo dõi trạng thái các đơn ứng tuyển của bạn.</p>
          </div>
          <div className="flex gap-1 bg-bg-2 border border-border-dark rounded-xl p-1">
            {viewButtons.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                  view === key
                    ? "bg-[rgba(124,58,237,.15)] text-[#B09BF8] border border-[rgba(124,58,237,.25)]"
                    : "text-t2 hover:text-t1"
                }`}
              >
                <span>{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-bg-2 rounded-2xl animate-pulse" />)}
        </div>
      ) : applications.length === 0 ? (
        <ScrollReveal direction="up" delay={0.05}>
          <div className="bg-bg-2 border border-border-dark rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-[18px] font-bold text-t0 mb-2">Chưa có đơn ứng tuyển</h3>
            <p className="text-[14px] text-t1 mb-4">Bắt đầu tìm kiếm và ứng tuyển ngay hôm nay!</p>
          </div>
        </ScrollReveal>
      ) : view === "list" ? (
        <ListView applications={applications} totalPages={totalPages} page={page} setPage={setPage} />
      ) : view === "kanban" ? (
        <KanbanView applications={applications} />
      ) : (
        <ScrollReveal direction="up" delay={0.05}>
          <div className="bg-bg-2 border border-border-dark rounded-2xl overflow-hidden divide-y divide-border-dark">
            {applications.map(app => {
              const { label, color } = formatApplicationStatus(app.status);
              return (
                <div key={app.id}>
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-t0 truncate">{app.job.title}</p>
                      <p className="text-[11px] text-t2">{app.job.employer.companyName} · {timeAgo(app.appliedAt)}</p>
                    </div>
                    <span className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg border ${color}`}>{label}</span>
                  </div>
                  <TimelineView appId={app.id} />
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
