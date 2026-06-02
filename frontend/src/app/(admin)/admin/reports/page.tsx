"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import { timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import { useToast } from "@/store/toastStore";

interface Report {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
  reporter: {
    id: string;
    email: string;
    role: string;
    candidate: { fullName: string } | null;
    employer: { companyName: string } | null;
  };
}

const STATUS_TABS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "REVIEWED", label: "Đã xem xét" },
  { value: "DISMISSED", label: "Bỏ qua" },
];

const REASON_LABELS: Record<string, string> = {
  SPAM: "Spam",
  MISLEADING: "Gây hiểu lầm",
  INAPPROPRIATE: "Không phù hợp",
  FRAUD: "Lừa đảo",
  OTHER: "Khác",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-[rgba(245,158,11,.12)] text-[#FCD34D] border-[rgba(245,158,11,.2)]",
  REVIEWED: "bg-[rgba(34,197,94,.1)] text-[#4ADE80] border-[rgba(34,197,94,.2)]",
  DISMISSED: "bg-[rgba(148,148,176,.08)] text-t2 border-border-dark",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  REVIEWED: "Đã xem xét",
  DISMISSED: "Đã bỏ qua",
};

export default function AdminReportsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const qc = useQueryClient();
  const toast = useToast();

  const params = { page, limit: 15, ...(status ? { status } : {}) };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminReports(params),
    queryFn: () => api.get("/admin/reports", { params }).then((r) => r.data),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ reportId, newStatus, adminNote }: { reportId: string; newStatus: string; adminNote?: string }) =>
      api.patch(`/admin/reports/${reportId}`, { status: newStatus, adminNote }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.adminReports() });
      toast.success(vars.newStatus === "REVIEWED" ? "Đã đánh dấu đã xem xét" : "Đã bỏ qua báo cáo");
    },
    onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại"),
  });

  function reporterName(r: Report["reporter"]) {
    if (r.candidate?.fullName) return r.candidate.fullName;
    if (r.employer?.companyName) return r.employer.companyName;
    return r.email;
  }

  return (
    <div className="p-6 max-w-5xl">
      <ScrollReveal direction="up">
        <h1 className="text-[22px] font-extrabold text-t0 mb-1">Báo cáo vi phạm</h1>
        <p className="text-[14px] text-t1 mb-6">{data?.total ?? 0} báo cáo</p>
      </ScrollReveal>

      {/* Status tabs */}
      <ScrollReveal direction="up" delay={0.05}>
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatus(tab.value); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-[13px] font-medium border transition-colors ${
                status === tab.value
                  ? "bg-[rgba(124,58,237,.12)] border-primary text-t0"
                  : "bg-transparent border-border-dark text-t1 hover:text-t0"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Reports list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-bg-2 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !data?.reports?.length ? (
        <ScrollReveal direction="up">
          <div className="text-center py-16 text-t2 text-[14px]">Không có báo cáo nào</div>
        </ScrollReveal>
      ) : (
        <div className="space-y-3">
          {data.reports.map((report: Report, i: number) => (
            <ScrollReveal key={report.id} direction="up" delay={i * 0.03}>
              <div className="bg-bg-2 border border-border-dark rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${STATUS_STYLES[report.status] ?? ""}`}>
                        {STATUS_LABELS[report.status] ?? report.status}
                      </span>
                      <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-lg border bg-bg-3 text-t1 border-border-dark">
                        {REASON_LABELS[report.reason] ?? report.reason}
                      </span>
                      <span className="text-[11px] text-t2">{timeAgo(report.createdAt)}</span>
                    </div>
                    <p className="text-[13px] text-t0 font-medium">
                      Người báo cáo: <span className="text-t1 font-normal">{reporterName(report.reporter)}</span>
                      <span className="ml-2 text-[11px] text-t2">({report.reporter.role})</span>
                    </p>
                    {report.description && (
                      <p className="text-[13px] text-t1 italic">"{report.description}"</p>
                    )}
                    {report.adminNote && (
                      <p className="text-[12px] text-t2">Ghi chú admin: {report.adminNote}</p>
                    )}
                    <p className="text-[12px] text-t2 font-mono">Job ID: {report.targetId}</p>
                  </div>

                  {report.status === "PENDING" && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <input
                        value={noteInputs[report.id] ?? ""}
                        onChange={e => setNoteInputs(prev => ({ ...prev, [report.id]: e.target.value }))}
                        placeholder="Ghi chú (tùy chọn)"
                        className="w-40 text-[12px] bg-bg-3 border border-border-dark rounded-lg px-2.5 py-1.5 text-t0 placeholder:text-t2 focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => resolveMutation.mutate({ reportId: report.id, newStatus: "REVIEWED", adminNote: noteInputs[report.id] })}
                        disabled={resolveMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-[rgba(34,197,94,.1)] border border-[rgba(34,197,94,.2)] text-[12px] font-semibold text-[#4ADE80] hover:bg-[rgba(34,197,94,.2)] disabled:opacity-50 transition-colors"
                      >
                        ✓ Đã xem xét
                      </button>
                      <button
                        onClick={() => resolveMutation.mutate({ reportId: report.id, newStatus: "DISMISSED", adminNote: noteInputs[report.id] })}
                        disabled={resolveMutation.isPending}
                        className="px-3 py-1.5 rounded-lg border border-border-dark text-[12px] font-semibold text-t2 hover:text-t0 disabled:opacity-50 transition-colors"
                      >
                        Bỏ qua
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
