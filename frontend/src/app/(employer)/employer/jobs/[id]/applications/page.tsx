"use client";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import { formatApplicationStatus, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/store/toastStore";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ xét duyệt" },
  { value: "REVIEWING", label: "Đang xem xét" },
  { value: "ACCEPTED", label: "Chấp nhận" },
  { value: "REJECTED", label: "Từ chối" },
];

const FILTER_TABS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "REVIEWING", label: "Đang xem" },
  { value: "ACCEPTED", label: "Chấp nhận" },
  { value: "REJECTED", label: "Từ chối" },
];

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  cvUrl: string;
  coverLetter?: string;
  note?: string;
  candidate: {
    id: string;
    fullName: string;
    headline?: string;
    avatarUrl?: string;
    user: { email: string };
  };
}

export default function JobApplicationsPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [statusSelects, setStatusSelects] = useState<Record<string, string>>({});

  const { data: jobData } = useQuery({
    queryKey: [...queryKeys.employerJobApplications(jobId, page), "job"],
    queryFn: () => api.get(`/employer/jobs/${jobId}`).then((r) => r.data),
    enabled: !!jobId,
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.employerJobApplications(jobId, page),
    queryFn: () => api.get(`/employer/jobs/${jobId}/applications`, { params: { page, limit: 10 } }).then((r) => r.data),
    enabled: !!jobId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ appId, status, note }: { appId: string; status: string; note?: string }) =>
      api.patch(`/employer/jobs/${jobId}/applications/${appId}`, { status, note }),
    onMutate: async ({ appId, status }) => {
      await qc.cancelQueries({ queryKey: queryKeys.employerJobApplications(jobId, page) });
      const previous = qc.getQueryData(queryKeys.employerJobApplications(jobId, page));
      qc.setQueryData(queryKeys.employerJobApplications(jobId, page), (old: Record<string, unknown> | undefined) => ({
        ...old,
        applications: (old?.applications as Application[] | undefined)?.map((a) =>
          a.id === appId ? { ...a, status } : a
        ) ?? [],
      }));
      return { previous };
    },
    onSuccess: () => toast.success("Đã cập nhật trạng thái đơn"),
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(queryKeys.employerJobApplications(jobId, page), ctx?.previous);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.employerJobApplications(jobId, page) });
      setUpdatingId(null);
    },
  });

  const allApplications: Application[] = data?.applications ?? [];
  const filtered = filterStatus ? allApplications.filter((a) => a.status === filterStatus) : allApplications;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-8 max-w-5xl">
      <ScrollReveal direction="up" className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/employer/jobs" className="text-[13px] text-t2 hover:text-t0 transition-colors">← Quản lý tin</Link>
        </div>
        <h1 className="text-[22px] font-extrabold text-t0">{jobData?.title ?? "Đơn ứng tuyển"}</h1>
        <p className="text-[14px] text-t1 mt-1">{data?.total ?? 0} đơn ứng tuyển</p>
      </ScrollReveal>

      {/* Filter tabs */}
      <ScrollReveal direction="up" delay={0.05} className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-4 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-colors ${
              filterStatus === tab.value ? "bg-[rgba(124,58,237,.15)] text-primary border border-[rgba(124,58,237,.3)]" : "border border-border-dark text-t1 hover:bg-white/[.04] hover:text-t0"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </ScrollReveal>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-bg-2 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-dark p-12 rounded-2xl text-center">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-[17px] font-bold text-t0 mb-2">Chưa có đơn ứng tuyển</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app, i) => {
            const { label, color } = formatApplicationStatus(app.status);
            const initial = app.candidate.fullName?.[0]?.toUpperCase() ?? "?";
            const currentStatus = statusSelects[app.id] ?? app.status;
            const hasChange = currentStatus !== app.status;

            return (
              <ScrollReveal key={app.id} direction="up" delay={i * 0.05}>
                <div className="card-dark p-5 rounded-2xl space-y-4">
                  {/* Candidate info row */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-bg-3 flex items-center justify-center shrink-0">
                      {app.candidate.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={app.candidate.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-[18px] font-black gradient-text">{initial}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-bold text-t0">{app.candidate.fullName}</p>
                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${color}`}>{label}</span>
                      </div>
                      {app.candidate.headline && <p className="text-[12px] text-t1">{app.candidate.headline}</p>}
                      <p className="text-[11px] text-t2">{app.candidate.user.email} · Nộp đơn {timeAgo(app.appliedAt)}</p>
                    </div>
                    <a href={app.cvUrl} target="_blank" rel="noreferrer" className="shrink-0 px-4 py-2 rounded-lg border border-border-dark text-[12px] text-t1 hover:bg-white/[.04] hover:text-t0 transition-colors">
                      📄 Xem CV
                    </a>
                  </div>

                  {/* Cover letter */}
                  {app.coverLetter && (
                    <div className="bg-bg-3/50 rounded-xl p-3">
                      <p className="text-[11px] font-semibold text-t2 uppercase tracking-wide mb-1.5">Thư giới thiệu</p>
                      <p className="text-[12px] text-t1 leading-relaxed">{app.coverLetter}</p>
                    </div>
                  )}

                  {/* Status change */}
                  <div className="flex items-start gap-3 pt-2 border-t border-border-dark/50">
                    <div className="flex-1 space-y-2">
                      <select
                        value={currentStatus}
                        onChange={(e) => setStatusSelects((prev) => ({ ...prev, [app.id]: e.target.value }))}
                        className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0 focus:outline-none focus:border-[rgba(124,58,237,.5)] transition-all"
                      >
                        {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="Ghi chú cho ứng viên (tùy chọn)..."
                        value={noteInputs[app.id] ?? app.note ?? ""}
                        onChange={(e) => setNoteInputs((prev) => ({ ...prev, [app.id]: e.target.value }))}
                        className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] transition-all"
                      />
                    </div>
                    <button
                      disabled={!hasChange || updatingId === app.id}
                      onClick={() => {
                        setUpdatingId(app.id);
                        updateMutation.mutate({ appId: app.id, status: currentStatus, note: noteInputs[app.id] });
                      }}
                      className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {updatingId === app.id ? "Đang lưu..." : "Cập nhật"}
                    </button>
                  </div>
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
