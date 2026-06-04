"use client";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import { formatApplicationStatus, formatApplicationTag, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/store/toastStore";

interface ApplicationNote {
  id: string;
  content: string;
  createdAt: string;
}

function NotesAccordion({ jobId, appId }: { jobId: string; appId: string }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const qc = useQueryClient();
  const toast = useToast();

  const { data: notes = [], isLoading } = useQuery<ApplicationNote[]>({
    queryKey: queryKeys.applicationNotes(jobId, appId),
    queryFn: () => api.get(`/employer/jobs/${jobId}/applications/${appId}/notes`).then((r) => r.data),
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: (content: string) => api.post(`/employer/jobs/${jobId}/applications/${appId}/notes`, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.applicationNotes(jobId, appId) });
      setDraft("");
      toast.success("Đã lưu ghi chú");
    },
    onError: () => toast.error("Lưu ghi chú thất bại"),
  });

  return (
    <div className="border-t border-border-dark/50 pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[12px] text-t2 hover:text-t0 transition-colors"
      >
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        Ghi chú nội bộ {notes.length > 0 && !isLoading && `(${notes.length})`}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {isLoading ? (
            <div className="h-8 bg-bg-3 rounded-lg animate-pulse" />
          ) : notes.length === 0 ? (
            <p className="text-[12px] text-t2 italic">Chưa có ghi chú nào.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notes.map((n) => (
                <div key={n.id} className="bg-bg-3/60 rounded-xl px-3 py-2">
                  <p className="text-[12px] text-t0 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                  <p className="text-[10px] text-t2 mt-1">{new Date(n.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && draft.trim()) { e.preventDefault(); addMutation.mutate(draft.trim()); } }}
              placeholder="Thêm ghi chú nội bộ... (Enter để lưu)"
              className="flex-1 bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[12px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.4)] transition-all"
            />
            <button
              type="button"
              disabled={!draft.trim() || addMutation.isPending}
              onClick={() => addMutation.mutate(draft.trim())}
              className="px-3 py-2 rounded-xl bg-[rgba(124,58,237,.15)] border border-[rgba(124,58,237,.3)] text-[11px] text-[#B09BF8] hover:bg-[rgba(124,58,237,.25)] transition-colors disabled:opacity-40"
            >
              {addMutation.isPending ? "..." : "Lưu"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ xét duyệt" },
  { value: "REVIEWING", label: "Đang xem xét" },
  { value: "ACCEPTED", label: "Chấp nhận" },
  { value: "REJECTED", label: "Từ chối" },
];

const TAG_OPTIONS = [
  { value: null,           label: "Không có tag" },
  { value: "SHORTLISTED",  label: "⭐ Tiềm năng cao" },
  { value: "POTENTIAL",    label: "💡 Tiềm năng" },
  { value: "ON_HOLD",      label: "⏸ Tạm giữ" },
];

const FILTER_TABS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "REVIEWING", label: "Đang xem" },
  { value: "ACCEPTED", label: "Chấp nhận" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "__SHORTLISTED__", label: "⭐ Shortlist" },
];

const KANBAN_COLUMNS = [
  { status: "PENDING",   label: "Chờ duyệt",    color: "border-[rgba(245,158,11,.4)]",  headerColor: "text-[#FCD34D]", bg: "bg-[rgba(245,158,11,.06)]" },
  { status: "REVIEWING", label: "Đang xem xét", color: "border-[rgba(59,130,246,.4)]",  headerColor: "text-[#60A5FA]", bg: "bg-[rgba(59,130,246,.06)]" },
  { status: "ACCEPTED",  label: "Chấp nhận",    color: "border-[rgba(34,197,94,.4)]",   headerColor: "text-[#4ADE80]", bg: "bg-[rgba(34,197,94,.06)]" },
  { status: "REJECTED",  label: "Từ chối",      color: "border-[rgba(239,68,68,.4)]",   headerColor: "text-red-400",   bg: "bg-[rgba(239,68,68,.06)]" },
];

interface Application {
  id: string;
  status: string;
  tag?: string | null;
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
  const [taggingId, setTaggingId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [statusSelects, setStatusSelects] = useState<Record<string, string>>({});
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await api.get(`/employer/jobs/${jobId}/applications/export`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv;charset=utf-8;" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `ung-vien-${jobId.slice(0, 8)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Xuất CSV thất bại, vui lòng thử lại");
    } finally {
      setExporting(false);
    }
  }

  const { data: jobData } = useQuery({
    queryKey: [...queryKeys.employerJobApplications(jobId, page), "job"],
    queryFn: () => api.get(`/employer/jobs/${jobId}`).then((r) => r.data),
    enabled: !!jobId,
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.employerJobApplications(jobId, page),
    queryFn: () => api.get(`/employer/jobs/${jobId}/applications`, { params: { page, limit: 10 } }).then((r) => r.data),
    enabled: !!jobId && viewMode === "list",
  });

  const { data: kanbanData, isLoading: kanbanLoading } = useQuery({
    queryKey: [...queryKeys.employerJobApplications(jobId), "kanban"],
    queryFn: () => api.get(`/employer/jobs/${jobId}/applications`, { params: { page: 1, limit: 200 } }).then((r) => r.data),
    enabled: !!jobId && viewMode === "kanban",
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
      qc.invalidateQueries({ queryKey: queryKeys.employerJobApplications(jobId) });
      setUpdatingId(null);
    },
  });

  const tagMutation = useMutation({
    mutationFn: ({ appId, tag }: { appId: string; tag: string | null }) =>
      api.patch(`/employer/jobs/${jobId}/applications/${appId}/tag`, { tag }),
    onMutate: async ({ appId, tag }) => {
      await qc.cancelQueries({ queryKey: queryKeys.employerJobApplications(jobId, page) });
      const previous = qc.getQueryData(queryKeys.employerJobApplications(jobId, page));
      qc.setQueryData(queryKeys.employerJobApplications(jobId, page), (old: Record<string, unknown> | undefined) => ({
        ...old,
        applications: (old?.applications as Application[] | undefined)?.map((a) =>
          a.id === appId ? { ...a, tag } : a
        ) ?? [],
      }));
      return { previous };
    },
    onSuccess: () => toast.success("Đã cập nhật tag"),
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(queryKeys.employerJobApplications(jobId, page), ctx?.previous);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.employerJobApplications(jobId) });
      setTaggingId(null);
    },
  });

  const allApplications: Application[] = data?.applications ?? [];
  const kanbanApplications: Application[] = kanbanData?.applications ?? [];
  const filtered = (() => {
    if (filterStatus === "__SHORTLISTED__") return allApplications.filter((a) => a.tag === "SHORTLISTED");
    if (filterStatus) return allApplications.filter((a) => a.status === filterStatus);
    return allApplications;
  })();
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      <ScrollReveal direction="up" className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/employer/jobs" className="text-[13px] text-t2 hover:text-t0 transition-colors">← Quản lý tin</Link>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-extrabold text-t0">{jobData?.title ?? "Đơn ứng tuyển"}</h1>
            <p className="text-[14px] text-t1 mt-1">{(data?.total ?? kanbanData?.total ?? 0)} đơn ứng tuyển</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-xl border border-border-dark overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-[12px] font-medium transition-colors ${viewMode === "list" ? "bg-[rgba(124,58,237,.15)] text-primary" : "text-t1 hover:bg-white/[.04]"}`}
              >
                ≡ List
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-2 text-[12px] font-medium transition-colors border-l border-border-dark ${viewMode === "kanban" ? "bg-[rgba(124,58,237,.15)] text-primary" : "text-t1 hover:bg-white/[.04]"}`}
              >
                ⊞ Kanban
              </button>
            </div>
            {((data?.total ?? 0) > 0 || (kanbanData?.total ?? 0) > 0) && (
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-dark text-[13px] text-t1 hover:text-t0 hover:border-[rgba(124,58,237,.3)] disabled:opacity-50 transition-colors"
              >
                {exporting ? <span className="inline-block w-3.5 h-3.5 border-2 border-t-transparent border-t1 rounded-full animate-spin" /> : <span>⬇</span>}
                Xuất CSV
              </button>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* ─── LIST VIEW ─── */}
      {viewMode === "list" && (
        <>
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
                const tagInfo = formatApplicationTag(app.tag);
                const initial = app.candidate.fullName?.[0]?.toUpperCase() ?? "?";
                const currentStatus = statusSelects[app.id] ?? app.status;
                const hasChange = currentStatus !== app.status;

                return (
                  <ScrollReveal key={app.id} direction="up" delay={i * 0.05}>
                    <div className="card-dark p-5 rounded-2xl space-y-4">
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[14px] font-bold text-t0">{app.candidate.fullName}</p>
                            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${color}`}>{label}</span>
                            {tagInfo && (
                              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${tagInfo.color}`}>
                                {tagInfo.icon} {tagInfo.label}
                              </span>
                            )}
                          </div>
                          {app.candidate.headline && <p className="text-[12px] text-t1">{app.candidate.headline}</p>}
                          <p className="text-[11px] text-t2">{app.candidate.user.email} · Nộp đơn {timeAgo(app.appliedAt)}</p>
                        </div>
                        <a href={app.cvUrl} target="_blank" rel="noreferrer" className="shrink-0 px-4 py-2 rounded-lg border border-border-dark text-[12px] text-t1 hover:bg-white/[.04] hover:text-t0 transition-colors">
                          📄 Xem CV
                        </a>
                      </div>

                      {app.coverLetter && (
                        <div className="bg-bg-3/50 rounded-xl p-3">
                          <p className="text-[11px] font-semibold text-t2 uppercase tracking-wide mb-1.5">Thư giới thiệu</p>
                          <p className="text-[12px] text-t1 leading-relaxed">{app.coverLetter}</p>
                        </div>
                      )}

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

                        <div className="shrink-0">
                          <select
                            value={app.tag ?? ""}
                            onChange={(e) => {
                              const newTag = e.target.value || null;
                              setTaggingId(app.id);
                              tagMutation.mutate({ appId: app.id, tag: newTag });
                            }}
                            disabled={taggingId === app.id}
                            className="bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[12px] text-t1 focus:outline-none focus:border-[rgba(124,58,237,.5)] transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {TAG_OPTIONS.map((opt) => (
                              <option key={String(opt.value)} value={opt.value ?? ""}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <NotesAccordion jobId={jobId} appId={app.id} />
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* ─── KANBAN VIEW ─── */}
      {viewMode === "kanban" && (
        <div className="overflow-x-auto pb-4">
          {kanbanLoading ? (
            <div className="flex gap-4 min-w-max">
              {KANBAN_COLUMNS.map((col) => (
                <div key={col.status} className="w-[260px] space-y-3">
                  <div className="h-8 bg-bg-2 rounded-xl animate-pulse" />
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 bg-bg-2 rounded-2xl animate-pulse" />)}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 min-w-max items-start">
              {KANBAN_COLUMNS.map((col) => {
                const colApps = kanbanApplications.filter((a) => a.status === col.status);
                return (
                  <div key={col.status} className={`w-[260px] rounded-2xl border ${col.color} ${col.bg} p-3`}>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className={`text-[13px] font-bold ${col.headerColor}`}>{col.label}</h3>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/20 ${col.headerColor}`}>
                        {colApps.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {colApps.length === 0 ? (
                        <div className="py-8 text-center text-[12px] text-t2 opacity-60">Không có đơn</div>
                      ) : (
                        colApps.map((app) => {
                          const tagInfo = formatApplicationTag(app.tag);
                          const initial = app.candidate.fullName?.[0]?.toUpperCase() ?? "?";
                          return (
                            <div key={app.id} className="bg-bg-2 border border-border-dark rounded-xl p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-bg-3 flex items-center justify-center shrink-0 text-[13px] font-black gradient-text">
                                  {app.candidate.avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={app.candidate.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                                  ) : initial}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[12px] font-semibold text-t0 truncate">{app.candidate.fullName}</p>
                                  {app.candidate.headline && <p className="text-[10px] text-t2 truncate">{app.candidate.headline}</p>}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-t2">
                                <span>{timeAgo(app.appliedAt)}</span>
                                {tagInfo && (
                                  <span className={`font-semibold px-1.5 py-0.5 rounded-md border ${tagInfo.color}`}>
                                    {tagInfo.icon}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={app.cvUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 text-center py-1 rounded-lg border border-border-dark text-[11px] text-t1 hover:bg-white/[.04] hover:text-t0 transition-colors"
                                >
                                  📄 CV
                                </a>
                                <select
                                  value={app.status}
                                  onChange={(e) => {
                                    setUpdatingId(app.id);
                                    updateMutation.mutate({ appId: app.id, status: e.target.value });
                                  }}
                                  disabled={updatingId === app.id}
                                  className="flex-1 bg-bg-3 border border-border-dark rounded-lg px-1 py-1 text-[10px] text-t1 focus:outline-none cursor-pointer disabled:opacity-50"
                                >
                                  {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
