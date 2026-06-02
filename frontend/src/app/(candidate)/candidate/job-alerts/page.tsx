"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import { useToast } from "@/store/toastStore";

interface JobAlert {
  id: string;
  industries: string[];
  locations: string[];
  jobTypes: string[];
  frequency: "DAILY" | "WEEKLY";
  isActive: boolean;
  lastSentAt: string | null;
  createdAt: string;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  CONTRACT: "Hợp đồng",
  INTERNSHIP: "Thực tập",
  FREELANCE: "Freelance",
};

const JOB_TYPES = Object.entries(JOB_TYPE_LABELS);
const FREQ_OPTIONS = [
  { value: "DAILY", label: "Hàng ngày" },
  { value: "WEEKLY", label: "Hàng tuần" },
];

const POPULAR_INDUSTRIES = [
  "Công nghệ thông tin",
  "Marketing",
  "Kế toán / Tài chính",
  "Nhân sự",
  "Kinh doanh / Bán hàng",
  "Thiết kế",
  "Y tế",
  "Giáo dục",
];

const POPULAR_LOCATIONS = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Remote"];

function TagInput({
  label,
  values,
  suggestions,
  onChange,
}: {
  label: string;
  values: string[];
  suggestions: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function add(val: string) {
    const trimmed = val.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setInput("");
  }

  return (
    <div>
      <label className="block text-[12px] font-semibold text-t1 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[rgba(124,58,237,.12)] border border-[rgba(124,58,237,.2)] text-[12px] font-medium text-[#B09BF8]">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:text-red-400">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(input); } }}
          placeholder="Nhập và nhấn Enter..."
          className="flex-1 bg-bg-2 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-primary"
        />
        <button type="button" onClick={() => add(input)} className="px-3 py-2 rounded-xl border border-border-dark text-t1 text-[13px] hover:text-t0 transition-colors">+</button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {suggestions.filter((s) => !values.includes(s)).map((s) => (
          <button key={s} type="button" onClick={() => onChange([...values, s])} className="text-[11px] px-2 py-1 rounded-lg border border-border-dark text-t2 hover:text-t0 hover:border-primary transition-colors">
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function JobAlertsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    industries: [] as string[],
    locations: [] as string[],
    jobTypes: [] as string[],
    frequency: "DAILY" as "DAILY" | "WEEKLY",
  });

  const { data: alerts, isLoading } = useQuery({
    queryKey: queryKeys.candidateJobAlerts(),
    queryFn: () => api.get("/candidate/job-alerts").then((r) => r.data as JobAlert[]),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/candidate/job-alerts", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.candidateJobAlerts() });
      setShowForm(false);
      setForm({ industries: [], locations: [], jobTypes: [], frequency: "DAILY" });
      toast.success("Đã tạo thông báo việc làm");
    },
    onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/candidate/job-alerts/${id}`, { isActive }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.candidateJobAlerts() });
      toast.success(vars.isActive ? "Đã bật thông báo" : "Đã tắt thông báo");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/candidate/job-alerts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.candidateJobAlerts() });
      toast.success("Đã xóa thông báo");
    },
  });

  function toggleJobType(jt: string) {
    setForm((f) => ({
      ...f,
      jobTypes: f.jobTypes.includes(jt) ? f.jobTypes.filter((x) => x !== jt) : [...f.jobTypes, jt],
    }));
  }

  return (
    <div className="p-6 max-w-3xl">
      <ScrollReveal direction="up">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-extrabold text-t0 mb-1">Thông báo việc làm</h1>
            <p className="text-[14px] text-t1">Nhận email khi có việc làm mới khớp tiêu chí của bạn</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-gradient hover:opacity-90 transition-opacity"
          >
            + Tạo thông báo
          </button>
        </div>
      </ScrollReveal>

      {/* Create form */}
      {showForm && (
        <ScrollReveal direction="up" delay={0.05}>
          <div className="bg-bg-2 border border-border-dark rounded-2xl p-5 mb-6 space-y-5">
            <h2 className="text-[15px] font-bold text-t0">Tạo thông báo mới</h2>

            <TagInput
              label="Ngành nghề"
              values={form.industries}
              suggestions={POPULAR_INDUSTRIES}
              onChange={(v) => setForm((f) => ({ ...f, industries: v }))}
            />

            <TagInput
              label="Địa điểm"
              values={form.locations}
              suggestions={POPULAR_LOCATIONS}
              onChange={(v) => setForm((f) => ({ ...f, locations: v }))}
            />

            <div>
              <label className="block text-[12px] font-semibold text-t1 mb-1.5">Hình thức làm việc</label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleJobType(value)}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-medium border transition-colors ${
                      form.jobTypes.includes(value)
                        ? "bg-[rgba(124,58,237,.12)] border-primary text-t0"
                        : "border-border-dark text-t1 hover:text-t0"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-t1 mb-1.5">Tần suất nhận email</label>
              <div className="flex gap-2">
                {FREQ_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, frequency: o.value as "DAILY" | "WEEKLY" }))}
                    className={`px-4 py-2 rounded-xl text-[13px] font-medium border transition-colors ${
                      form.frequency === o.value
                        ? "bg-[rgba(124,58,237,.12)] border-primary text-t0"
                        : "border-border-dark text-t1 hover:text-t0"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-gradient hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {createMutation.isPending ? "Đang tạo..." : "Tạo thông báo"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-xl text-[13px] font-medium border border-border-dark text-t1 hover:text-t0 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Alerts list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-bg-2 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !alerts?.length ? (
        <ScrollReveal direction="up">
          <div className="text-center py-20 space-y-3">
            <div className="text-4xl">🔔</div>
            <p className="text-t1 text-[14px]">Bạn chưa có thông báo nào</p>
            <p className="text-t2 text-[13px]">Tạo thông báo để nhận email khi có việc làm phù hợp</p>
          </div>
        </ScrollReveal>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <ScrollReveal key={alert.id} direction="up" delay={i * 0.04}>
              <div className={`bg-bg-2 border rounded-2xl p-5 transition-colors ${alert.isActive ? "border-border-dark" : "border-border-dark opacity-60"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${
                        alert.isActive
                          ? "bg-[rgba(34,197,94,.1)] text-[#4ADE80] border-[rgba(34,197,94,.2)]"
                          : "bg-bg-3 text-t2 border-border-dark"
                      }`}>
                        {alert.isActive ? "Đang bật" : "Đã tắt"}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-lg border border-border-dark bg-bg-3 text-t1">
                        {alert.frequency === "DAILY" ? "Hàng ngày" : "Hàng tuần"}
                      </span>
                    </div>

                    {alert.industries.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[11px] text-t2">Ngành:</span>
                        {alert.industries.map((v) => (
                          <span key={v} className="text-[11px] text-[#B09BF8] bg-[rgba(124,58,237,.08)] px-2 py-0.5 rounded-md">{v}</span>
                        ))}
                      </div>
                    )}
                    {alert.locations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[11px] text-t2">Địa điểm:</span>
                        {alert.locations.map((v) => (
                          <span key={v} className="text-[11px] text-[#60A5FA] bg-[rgba(59,130,246,.08)] px-2 py-0.5 rounded-md">{v}</span>
                        ))}
                      </div>
                    )}
                    {alert.jobTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[11px] text-t2">Hình thức:</span>
                        {alert.jobTypes.map((v) => (
                          <span key={v} className="text-[11px] text-t1 bg-bg-3 px-2 py-0.5 rounded-md">{JOB_TYPE_LABELS[v] ?? v}</span>
                        ))}
                      </div>
                    )}
                    {alert.industries.length === 0 && alert.locations.length === 0 && alert.jobTypes.length === 0 && (
                      <p className="text-[13px] text-t2">Tất cả việc làm mới</p>
                    )}

                    {alert.lastSentAt ? (
                      <p className="text-[11px] text-t2">Gửi lần cuối: {timeAgo(alert.lastSentAt)}</p>
                    ) : (
                      <p className="text-[11px] text-t2">Chưa gửi lần nào • Tạo {timeAgo(alert.createdAt)}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => toggleMutation.mutate({ id: alert.id, isActive: !alert.isActive })}
                      disabled={toggleMutation.isPending}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors disabled:opacity-50 ${
                        alert.isActive
                          ? "border-border-dark text-t1 hover:text-t0"
                          : "bg-[rgba(34,197,94,.1)] border-[rgba(34,197,94,.2)] text-[#4ADE80] hover:bg-[rgba(34,197,94,.2)]"
                      }`}
                    >
                      {alert.isActive ? "Tắt" : "Bật"}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(alert.id)}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-1.5 rounded-lg border border-border-dark text-[12px] font-semibold text-t2 hover:text-red-400 hover:border-red-400/40 transition-colors disabled:opacity-50"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
