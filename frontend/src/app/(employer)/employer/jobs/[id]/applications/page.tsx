"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import { formatApplicationStatus, formatApplicationTag, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import { useToast } from "@/store/toastStore";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { MonoNumber } from "@/components/ui/MonoNumber";
import { InterviewAccordion } from "@/components/employer/InterviewAccordion";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ xét duyệt" },
  { value: "REVIEWING", label: "Đang xem xét" },
  { value: "ACCEPTED", label: "Chấp nhận" },
  { value: "REJECTED", label: "Từ chối" },
];
const TAG_OPTIONS = [
  { value: null, label: "Không có tag" },
  { value: "SHORTLISTED", label: "⭐ Tiềm năng cao" },
  { value: "POTENTIAL", label: "💡 Tiềm năng" },
  { value: "ON_HOLD", label: "⏸ Tạm giữ" },
];
const FILTER_TABS = [
  { value: "", label: "tất cả" },
  { value: "PENDING", label: "chờ duyệt" },
  { value: "REVIEWING", label: "đang xem" },
  { value: "ACCEPTED", label: "chấp nhận" },
  { value: "REJECTED", label: "từ chối" },
];

interface ScreeningAnswer {
  id: string;
  answer: string;
  question: { question: string; type: string };
}
interface ApplicationNote {
  id: string;
  content: string;
  createdAt: string;
}
interface Application {
  id: string;
  status: string;
  tag?: string | null;
  appliedAt: string;
  cvUrl: string;
  coverLetter?: string;
  note?: string;
  screeningAnswers?: ScreeningAnswer[];
  candidate: {
    id: string;
    fullName: string;
    headline?: string;
    avatarUrl?: string;
    user: { email: string };
  };
}

function NotesInline({ jobId, appId }: { jobId: string; appId: string }) {
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
    mutationFn: (content: string) =>
      api.post(`/employer/jobs/${jobId}/applications/${appId}/notes`, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.applicationNotes(jobId, appId) });
      setDraft("");
      toast.success("Đã lưu ghi chú");
    },
    onError: () => toast.error("Lưu ghi chú thất bại"),
  });

  return (
    <div className="border-t border-[var(--border)] pt-3 mt-3 font-mono text-[12px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[var(--t2)] hover:text-[var(--t0)] transition-colors"
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "" : "-rotate-90"}`} />
        ghi chú nội bộ {notes.length > 0 && !isLoading && `(${notes.length})`}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {isLoading ? (
            <p className="text-[var(--t2)]">đang tải…</p>
          ) : notes.length === 0 ? (
            <p className="text-[var(--t2)] italic">Chưa có ghi chú.</p>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {notes.map((n) => (
                <li key={n.id} className="border-l-2 border-[var(--border)] pl-3">
                  <p className="text-[var(--t1)] whitespace-pre-wrap">{n.content}</p>
                  <p className="text-[10px] text-[var(--t2)] mt-1">
                    {new Date(n.createdAt).toLocaleString("vi-VN")}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2 mt-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && draft.trim()) {
                  e.preventDefault();
                  addMutation.mutate(draft.trim());
                }
              }}
              placeholder="Thêm ghi chú nội bộ… (Enter để lưu)"
              className="flex-1 bg-transparent border border-[var(--border)] rounded-sharp px-3 py-2 text-[12px] text-[var(--t0)] placeholder:text-[var(--t2)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            <button
              type="button"
              disabled={!draft.trim() || addMutation.isPending}
              onClick={() => addMutation.mutate(draft.trim())}
              className="px-3 py-2 rounded-sharp border border-[var(--accent)] text-[var(--accent)] text-[11px] hover:bg-[var(--accent-dim)] disabled:opacity-40 transition-colors"
            >
              {addMutation.isPending ? "…" : "lưu"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
      toast.error("Xuất CSV thất bại");
    } finally {
      setExporting(false);
    }
  }

  const { data: jobData } = useQuery({
    queryKey: [...queryKeys.employerJobApplications(jobId, page), "job"],
    queryFn: () => api.get(`/employer/jobs/${jobId}`).then((r) => r.data),
    enabled: !!jobId,
  });

  const listQueryKey = [...queryKeys.employerJobApplications(jobId, page), filterStatus];
  const { data, isLoading } = useQuery({
    queryKey: listQueryKey,
    queryFn: () =>
      api
        .get(`/employer/jobs/${jobId}/applications`, {
          params: { page, limit: 10, ...(filterStatus && { status: filterStatus }) },
        })
        .then((r) => r.data),
    enabled: !!jobId,
    staleTime: 30_000,
  });

  const applications: Application[] = data?.applications ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const updateMutation = useMutation({
    mutationFn: ({ appId, status, note }: { appId: string; status: string; note?: string }) =>
      api.patch(`/employer/jobs/${jobId}/applications/${appId}`, { status, note }),
    onMutate: async ({ appId, status }) => {
      await qc.cancelQueries({ queryKey: listQueryKey });
      const previous = qc.getQueryData(listQueryKey);
      qc.setQueryData(listQueryKey, (old: Record<string, unknown> | undefined) => ({
        ...old,
        applications:
          (old?.applications as Application[] | undefined)?.map((a) =>
            a.id === appId ? { ...a, status } : a,
          ) ?? [],
      }));
      return { previous };
    },
    onSuccess: () => toast.success("Đã cập nhật"),
    onError: (_e, _v, ctx) => {
      qc.setQueryData(listQueryKey, ctx?.previous);
      toast.error("Có lỗi xảy ra");
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
      await qc.cancelQueries({ queryKey: listQueryKey });
      const previous = qc.getQueryData(listQueryKey);
      qc.setQueryData(listQueryKey, (old: Record<string, unknown> | undefined) => ({
        ...old,
        applications:
          (old?.applications as Application[] | undefined)?.map((a) =>
            a.id === appId ? { ...a, tag } : a,
          ) ?? [],
      }));
      return { previous };
    },
    onSuccess: () => toast.success("Đã đặt tag"),
    onError: (_e, _v, ctx) => {
      qc.setQueryData(listQueryKey, ctx?.previous);
      toast.error("Có lỗi xảy ra");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.employerJobApplications(jobId) });
      setTaggingId(null);
    },
  });

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  const bulkUpdate = async (status: string) => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    try {
      await Promise.all(
        ids.map((appId) => api.patch(`/employer/jobs/${jobId}/applications/${appId}`, { status })),
      );
      qc.invalidateQueries({ queryKey: queryKeys.employerJobApplications(jobId) });
      toast.success(`Đã cập nhật ${ids.length} đơn`);
      clearSelection();
    } catch {
      toast.error("Bulk update thất bại");
    }
  };

  return (
    <div className="pb-10">
      <section className="px-4 md:px-6 py-8">
        <Link
          href="/employer/jobs"
          className="font-mono text-[12px] text-[var(--t2)] hover:text-[var(--t0)] transition-colors"
        >
          ← tin tuyển dụng
        </Link>
        <h1 className="text-[clamp(22px,3vw,30px)] font-medium tracking-tight text-[var(--t0)] mt-2">
          {jobData?.title ?? "Đơn ứng tuyển"}
        </h1>
        <div className="flex items-end justify-between mt-2 gap-3 flex-wrap">
          <p className="font-mono text-[13px] text-[var(--t1)]">
            {`> ${total} đơn · trang ${page}/${totalPages}`}
          </p>
          {total > 0 && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="font-mono text-[13px] px-3 py-1.5 border border-[var(--border)] text-[var(--t1)] rounded-sharp hover:text-[var(--t0)] hover:border-[var(--accent)] disabled:opacity-50 transition-colors"
            >
              {exporting ? "đang xuất…" : "⬇ xuất CSV"}
            </button>
          )}
        </div>
      </section>

      <div className="px-4 md:px-6 pb-4 flex flex-wrap gap-3 border-t border-[var(--border)] pt-4 font-mono text-[12px]">
        {FILTER_TABS.map((tab) => {
          const active = filterStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setFilterStatus(tab.value);
                setPage(1);
                setExpandedId(null);
                clearSelection();
              }}
              className={`transition-colors ${
                active ? "text-[var(--accent)]" : "text-[var(--t2)] hover:text-[var(--t0)]"
              }`}
            >
              {active ? `[${tab.label}]` : tab.label}
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <div
          data-testid="bulk-action-bar"
          className="sticky top-16 z-10 px-4 md:px-6 py-3 bg-[var(--accent-dim)] border-y border-[var(--accent)] flex flex-wrap items-center gap-3 font-mono text-[13px]"
        >
          <span className="text-[var(--t0)]">
            <MonoNumber size="sm" tone="accent">
              {selected.size}
            </MonoNumber>{" "}
            đã chọn
          </span>
          <button
            onClick={() => bulkUpdate("ACCEPTED")}
            className="px-3 py-1.5 border border-green-400/40 text-green-400 rounded-sharp hover:bg-green-400/10 transition-colors"
          >
            ✓ chấp nhận tất
          </button>
          <button
            onClick={() => bulkUpdate("REJECTED")}
            className="px-3 py-1.5 border border-red-400/40 text-red-400 rounded-sharp hover:bg-red-400/10 transition-colors"
          >
            ✕ từ chối tất
          </button>
          <button
            onClick={() => bulkUpdate("REVIEWING")}
            className="px-3 py-1.5 border border-blue-400/40 text-blue-400 rounded-sharp hover:bg-blue-400/10 transition-colors"
          >
            ◐ đang xem
          </button>
          <button
            onClick={clearSelection}
            className="ml-auto text-[var(--t2)] hover:text-[var(--t0)] transition-colors"
          >
            bỏ chọn
          </button>
        </div>
      )}

      <HairlineSection label="DANH SÁCH">
        {isLoading ? (
          <p className="px-4 md:px-6 py-8 font-mono text-[13px] text-[var(--t2)]">đang tải…</p>
        ) : applications.length === 0 ? (
          <p className="px-4 md:px-6 py-10 font-mono text-[13px] text-[var(--t2)] text-center">
            Chưa có đơn ứng tuyển.
          </p>
        ) : (
          applications.map((app, i) => {
            const { label, color } = formatApplicationStatus(app.status);
            const tagInfo = formatApplicationTag(app.tag);
            const isExpanded = expandedId === app.id;
            const isSelected = selected.has(app.id);
            const currentStatus = statusSelects[app.id] ?? app.status;
            const hasChange = currentStatus !== app.status;
            const idx = String((page - 1) * 10 + i + 1).padStart(2, "0");

            return (
              <div
                key={app.id}
                data-testid="employer-app-row"
                className={`border-b border-[var(--border)] border-l-2 ${
                  isExpanded
                    ? "border-l-[var(--accent)] bg-[var(--accent-dim)]"
                    : isSelected
                    ? "border-l-[var(--accent)]"
                    : "border-l-transparent"
                }`}
              >
                <div className="grid grid-cols-[36px_64px_1fr_auto] md:grid-cols-[44px_80px_1fr_auto] items-center gap-4 px-4 md:px-6 min-h-[var(--row-h)] hover:bg-[var(--accent-dim)] transition-colors">
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      data-testid="bulk-select-checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(app.id)}
                      className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    aria-expanded={isExpanded}
                    className="col-span-3 grid grid-cols-[1fr_auto] items-center gap-3 text-left"
                  >
                    <div className="grid grid-cols-[64px_1fr] md:grid-cols-[80px_1fr] items-center gap-4 min-w-0">
                      <MonoNumber size="lg" tone="muted">
                        {idx}
                      </MonoNumber>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[15px] md:text-[17px] font-semibold text-[var(--t0)] truncate">
                            {app.candidate.fullName}
                          </span>
                          {tagInfo && (
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sharp border ${tagInfo.color}`}
                            >
                              {tagInfo.icon} {tagInfo.label}
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[12px] text-[var(--t1)] truncate mt-0.5">
                          {app.candidate.headline ? `${app.candidate.headline} · ` : ""}
                          {timeAgo(app.appliedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-[12px] text-[var(--accent)] hover:underline"
                      >
                        📄 CV
                      </a>
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-sharp border ${color}`}>
                        {label}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[var(--t2)] transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                </div>

                {isExpanded && (
                  <div
                    data-testid="employer-app-expanded"
                    className="px-4 md:px-6 pb-5 pt-2 border-t border-[var(--border)] space-y-4"
                  >
                    <p className="font-mono text-[12px] text-[var(--t2)] mt-3">{app.candidate.user.email}</p>

                    {app.coverLetter && (
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--t2)] mb-1.5">
                          thư giới thiệu
                        </p>
                        <p className="text-[13px] text-[var(--t1)] leading-relaxed whitespace-pre-wrap">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}

                    {app.screeningAnswers && app.screeningAnswers.length > 0 && (
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--t2)] mb-2">
                          câu hỏi sàng lọc ({app.screeningAnswers.length})
                        </p>
                        <ul className="space-y-2 font-mono text-[12px]">
                          {app.screeningAnswers.map((sa) => (
                            <li key={sa.id} className="border-l-2 border-[var(--border)] pl-3">
                              <p className="text-[var(--t2)] italic">{sa.question.question}</p>
                              <p className="text-[var(--t0)] font-medium mt-0.5">{sa.answer}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-start gap-3 pt-3 border-t border-[var(--border)] flex-wrap">
                      <div className="flex-1 min-w-[200px] space-y-2">
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            setStatusSelects((prev) => ({ ...prev, [app.id]: e.target.value }))
                          }
                          className="w-full bg-transparent border border-[var(--border)] rounded-sharp px-3 py-2 text-[13px] text-[var(--t0)] focus:outline-none focus:border-[var(--accent)] transition-colors font-mono"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[var(--bg-2)]">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Ghi chú cho ứng viên…"
                          value={noteInputs[app.id] ?? app.note ?? ""}
                          onChange={(e) =>
                            setNoteInputs((prev) => ({ ...prev, [app.id]: e.target.value }))
                          }
                          className="w-full bg-transparent border border-[var(--border)] rounded-sharp px-3 py-2 text-[13px] text-[var(--t0)] placeholder:text-[var(--t2)] focus:outline-none focus:border-[var(--accent)] transition-colors font-mono"
                        />
                      </div>
                      <button
                        disabled={!hasChange || updatingId === app.id}
                        onClick={() => {
                          setUpdatingId(app.id);
                          updateMutation.mutate({
                            appId: app.id,
                            status: currentStatus,
                            note: noteInputs[app.id],
                          });
                        }}
                        className="px-4 py-2 font-mono text-[13px] border border-[var(--accent)] text-[var(--accent)] rounded-sharp hover:bg-[var(--accent-dim)] disabled:opacity-40 transition-colors"
                      >
                        {updatingId === app.id ? "…" : "cập nhật"}
                      </button>
                      <select
                        value={app.tag ?? ""}
                        onChange={(e) => {
                          const newTag = e.target.value || null;
                          setTaggingId(app.id);
                          tagMutation.mutate({ appId: app.id, tag: newTag });
                        }}
                        disabled={taggingId === app.id}
                        className="bg-transparent border border-[var(--border)] rounded-sharp px-3 py-2 text-[12px] text-[var(--t1)] font-mono focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {TAG_OPTIONS.map((opt) => (
                          <option
                            key={String(opt.value)}
                            value={opt.value ?? ""}
                            className="bg-[var(--bg-2)]"
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <NotesInline jobId={jobId} appId={app.id} />
                    <InterviewAccordion jobId={jobId} appId={app.id} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </HairlineSection>

      {totalPages > 1 && (
        <div className="px-4 md:px-6 py-6 flex items-center justify-between font-mono text-[13px] border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              setExpandedId(null);
            }}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 text-[var(--t1)] hover:text-[var(--t0)] disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> prev
          </button>
          <span className="text-[var(--t2)] tabular-nums">
            page {page}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => {
              setPage((p) => Math.min(totalPages, p + 1));
              setExpandedId(null);
            }}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 text-[var(--t1)] hover:text-[var(--t0)] disabled:opacity-30"
          >
            next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
