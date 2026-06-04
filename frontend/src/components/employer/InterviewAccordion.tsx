"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import api from "@/lib/api";
import { useToast } from "@/store/toastStore";

interface InterviewSchedule {
  id: string;
  scheduledAt: string;
  location: string | null;
  meetingLink: string | null;
  note: string | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
}

interface Props {
  jobId: string;
  appId: string;
}

const STATUS_CONFIG = {
  PENDING: { label: "Chờ xác nhận", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  CONFIRMED: { label: "Đã xác nhận", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  CANCELLED: { label: "Đã từ chối", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function InterviewAccordion({ jobId, appId }: Props) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ scheduledAt: "", location: "", meetingLink: "", note: "" });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();
  const toast = useToast();

  const { data: interviews = [], isLoading } = useQuery<InterviewSchedule[]>({
    queryKey: queryKeys.interviewSchedules(jobId, appId),
    queryFn: () => api.get(`/employer/jobs/${jobId}/applications/${appId}/interviews`).then((r) => r.data),
    enabled: open,
    staleTime: 30_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.interviewSchedules(jobId, appId) });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post(`/employer/jobs/${jobId}/applications/${appId}/interviews`, data),
    onSuccess: () => { toast.success("Đã lên lịch phỏng vấn"); setShowForm(false); setForm({ scheduledAt: "", location: "", meetingLink: "", note: "" }); invalidate(); },
    onError: () => toast.error("Có lỗi xảy ra"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) =>
      api.patch(`/employer/jobs/${jobId}/applications/${appId}/interviews/${id}`, data),
    onSuccess: () => { toast.success("Đã cập nhật lịch"); setEditId(null); setForm({ scheduledAt: "", location: "", meetingLink: "", note: "" }); invalidate(); },
    onError: () => toast.error("Có lỗi xảy ra"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/employer/jobs/${jobId}/applications/${appId}/interviews/${id}`),
    onSuccess: () => { toast.info("Đã xóa lịch phỏng vấn"); setConfirmDeleteId(null); invalidate(); },
    onError: () => toast.error("Có lỗi xảy ra"),
  });

  function startEdit(iv: InterviewSchedule) {
    setEditId(iv.id);
    // Convert UTC ISO to local datetime-local value
    const local = new Date(iv.scheduledAt);
    const pad = (n: number) => String(n).padStart(2, "0");
    const localStr = `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`;
    setForm({ scheduledAt: localStr, location: iv.location ?? "", meetingLink: iv.meetingLink ?? "", note: iv.note ?? "" });
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.scheduledAt) return;
    if (editId) updateMutation.mutate({ id: editId, data: form });
    else createMutation.mutate(form);
  }

  const hasPending = interviews.some((iv) => iv.status === "PENDING" || iv.status === "CONFIRMED");

  return (
    <div className="border-t border-border-dark">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-white/[.02] transition-colors"
      >
        <span className="text-[12px] font-semibold text-t1 flex items-center gap-2">
          📅 Lịch phỏng vấn
          {interviews.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[rgba(124,58,237,.15)] text-[#B09BF8] border border-[rgba(124,58,237,.2)]">
              {interviews.length}
            </span>
          )}
        </span>
        <svg className={`w-4 h-4 text-t2 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-4 space-y-3">
          {isLoading ? (
            <div className="py-4 flex justify-center"><div className="w-4 h-4 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              {interviews.map((iv) => {
                const cfg = STATUS_CONFIG[iv.status];
                return (
                  <div key={iv.id} className="rounded-xl border border-border-dark bg-bg-3 p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-t0">{formatDateTime(iv.scheduledAt)}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    {iv.location && <p className="text-[12px] text-t1">📍 {iv.location}</p>}
                    {iv.meetingLink && (
                      <a href={iv.meetingLink} target="_blank" rel="noreferrer" className="text-[12px] text-[#7C3AED] hover:underline block truncate">
                        🔗 {iv.meetingLink}
                      </a>
                    )}
                    {iv.note && <p className="text-[12px] text-t2 italic">{iv.note}</p>}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { startEdit(iv); setShowForm(false); }}
                        className="text-[11px] px-2.5 py-1 rounded-lg border border-border-dark text-t1 hover:bg-white/[.04] hover:text-t0 transition-colors"
                      >
                        Sửa
                      </button>
                      {confirmDeleteId === iv.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => deleteMutation.mutate(iv.id)} className="text-[11px] px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors">Xóa thật</button>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-[11px] px-2.5 py-1 rounded-lg border border-border-dark text-t2 hover:text-t0 transition-colors">Hủy</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(iv.id)} className="text-[11px] px-2.5 py-1 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-400/10 transition-colors">Xóa</button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Form tạo mới hoặc sửa */}
              {(showForm || editId) && (
                <form onSubmit={handleSubmit} className="rounded-xl border border-[rgba(124,58,237,.3)] bg-[rgba(124,58,237,.04)] p-3 space-y-2.5">
                  <p className="text-[12px] font-semibold text-[#B09BF8]">{editId ? "Cập nhật lịch phỏng vấn" : "Lên lịch phỏng vấn mới"}</p>
                  <div>
                    <label className="text-[11px] text-t2 mb-1 block">Thời gian *</label>
                    <input
                      type="datetime-local"
                      required
                      value={form.scheduledAt}
                      onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                      className="w-full bg-bg-3 border border-border-dark rounded-lg px-3 py-2 text-[13px] text-t0 focus:outline-none focus:border-[rgba(124,58,237,.5)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-t2 mb-1 block">Địa điểm</label>
                    <input
                      type="text"
                      placeholder="VD: Tầng 5, 123 Nguyễn Văn Linh hoặc Online"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      className="w-full bg-bg-3 border border-border-dark rounded-lg px-3 py-2 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-t2 mb-1 block">Link phỏng vấn (Zoom / Meet)</label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={form.meetingLink}
                      onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))}
                      className="w-full bg-bg-3 border border-border-dark rounded-lg px-3 py-2 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-t2 mb-1 block">Ghi chú</label>
                    <textarea
                      rows={2}
                      placeholder="Ghi chú thêm cho ứng viên..."
                      value={form.note}
                      onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                      className="w-full bg-bg-3 border border-border-dark rounded-lg px-3 py-2 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] resize-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditId(null); setForm({ scheduledAt: "", location: "", meetingLink: "", note: "" }); }}
                      className="px-3 py-1.5 rounded-lg border border-border-dark text-[12px] text-t1 hover:bg-white/[.04] transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="px-3 py-1.5 rounded-lg btn-primary text-[12px] font-semibold disabled:opacity-60"
                    >
                      {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : editId ? "Cập nhật" : "Lên lịch & gửi email mời"}
                    </button>
                  </div>
                </form>
              )}

              {!showForm && !editId && !hasPending && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="w-full py-2 rounded-xl border border-dashed border-[rgba(124,58,237,.3)] text-[12px] text-[#B09BF8] hover:bg-[rgba(124,58,237,.06)] transition-colors"
                >
                  + Lên lịch phỏng vấn
                </button>
              )}
              {!showForm && !editId && hasPending && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="w-full py-2 rounded-xl border border-dashed border-border-dark text-[12px] text-t2 hover:bg-white/[.02] transition-colors"
                >
                  + Thêm lịch mới
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
