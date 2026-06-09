"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import { formatApplicationStatus, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import { useToast } from "@/store/toastStore";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { MonoNumber } from "@/components/ui/MonoNumber";

interface StatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
}

interface InterviewInfo {
  id: string;
  scheduledAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  location: string | null;
  meetingLink: string | null;
}

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  coverLetter?: string;
  note?: string;
  cvUrl: string;
  interviews?: InterviewInfo[];
  job: {
    id: string;
    title: string;
    location: string;
    employer: { companyName: string };
  };
}

const INTERVIEW_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ xác nhận", color: "text-yellow-400 border-yellow-400/30" },
  CONFIRMED: { label: "Đã xác nhận", color: "text-green-400 border-green-400/30" },
  CANCELLED: { label: "Đã từ chối", color: "text-red-400 border-red-400/30" },
};

function InterviewBadge({ appId, interview }: { appId: string; interview: InterviewInfo }) {
  const qc = useQueryClient();
  const toast = useToast();
  const cfg = INTERVIEW_STATUS_LABELS[interview.status];
  const dateStr = new Date(interview.scheduledAt).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const respondMutation = useMutation({
    mutationFn: (action: "confirm" | "cancel") =>
      api.patch(`/candidate/applications/${appId}/interviews/${interview.id}/respond`, { action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.candidateApplications() });
      toast.success("Đã phản hồi lịch phỏng vấn");
    },
    onError: () => toast.error("Có lỗi xảy ra"),
  });

  return (
    <div className="border-t border-[var(--border)] pt-4 mt-4 font-mono text-[12px]">
      <div className="flex items-center gap-3 flex-wrap text-[var(--t1)]">
        <span className="text-[var(--t2)]">phỏng vấn:</span>
        <span className="text-[var(--t0)]">{dateStr}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sharp border ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>
      {interview.location && (
        <p className="text-[var(--t1)] mt-1">{`> ${interview.location}`}</p>
      )}
      {interview.meetingLink && (
        <a
          href={interview.meetingLink}
          target="_blank"
          rel="noreferrer"
          className="block text-[var(--accent)] hover:underline mt-1 truncate"
        >
          {interview.meetingLink}
        </a>
      )}
      {interview.status === "PENDING" && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => respondMutation.mutate("confirm")}
            disabled={respondMutation.isPending}
            className="px-3 py-1.5 border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-60 rounded-sharp"
          >
            ✓ xác nhận
          </button>
          <button
            onClick={() => respondMutation.mutate("cancel")}
            disabled={respondMutation.isPending}
            className="px-3 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-60 rounded-sharp"
          >
            ✕ từ chối
          </button>
        </div>
      )}
    </div>
  );
}

function Timeline({ appId }: { appId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.applicationTimeline(appId),
    queryFn: () => api.get(`/candidate/applications/${appId}/timeline`).then((r) => r.data),
  });

  if (isLoading) {
    return <p className="font-mono text-[12px] text-[var(--t2)]">đang tải…</p>;
  }
  const history: StatusHistory[] = data?.statusHistory ?? [];
  if (history.length === 0) {
    return <p className="font-mono text-[12px] text-[var(--t2)]">trạng thái ban đầu: Chờ duyệt</p>;
  }
  return (
    <ul className="font-mono text-[12px] space-y-2">
      {history.map((entry) => {
        const { label } = formatApplicationStatus(entry.toStatus);
        const fromLabel = entry.fromStatus ? formatApplicationStatus(entry.fromStatus).label : null;
        return (
          <li key={entry.id} className="flex items-baseline gap-3 text-[var(--t1)]">
            <span className="text-[var(--t2)] tabular-nums">{timeAgo(entry.createdAt)}</span>
            <span className="flex-1">
              {fromLabel && <span className="text-[var(--t2)]">{fromLabel} → </span>}
              <span className="text-[var(--t0)]">{label}</span>
              {entry.note && <span className="text-[var(--t2)]">{`  // ${entry.note}`}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default function CandidateApplicationsPage() {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.candidateApplications(page),
    queryFn: () => api.get("/candidate/applications", { params: { page, limit: 20 } }).then((r) => r.data),
    staleTime: 30_000,
  });

  const applications: Application[] = data?.applications ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="pb-10">
      <section className="px-4 md:px-6 py-8">
        <h1 className="text-[clamp(26px,3.5vw,36px)] font-medium tracking-tight text-[var(--t0)]">
          Đơn ứng tuyển
        </h1>
        <p className="font-mono text-[13px] text-[var(--t1)] mt-2">
          {`> ${total} đơn · trang ${page}/${totalPages}`}
        </p>
      </section>

      <HairlineSection label="DANH SÁCH">
        {isLoading ? (
          <p className="px-4 md:px-6 py-8 font-mono text-[13px] text-[var(--t2)]">đang tải…</p>
        ) : applications.length === 0 ? (
          <div className="px-4 md:px-6 py-10 text-center">
            <p className="font-mono text-[13px] text-[var(--t2)]">Bạn chưa có đơn ứng tuyển nào.</p>
            <a
              href="/jobs"
              className="inline-block mt-3 font-mono text-[13px] text-[var(--accent)] hover:underline"
            >
              → tìm việc
            </a>
          </div>
        ) : (
          applications.map((app, i) => {
            const { label, color } = formatApplicationStatus(app.status);
            const isExpanded = expanded === app.id;
            const idx = String((page - 1) * 20 + i + 1).padStart(2, "0");
            const activeInterview =
              app.interviews?.find((iv) => iv.status !== "CANCELLED");
            return (
              <div
                key={app.id}
                className={`border-b border-[var(--border)] border-l-2 ${
                  isExpanded ? "border-l-[var(--accent)] bg-[var(--accent-dim)]" : "border-l-transparent"
                }`}
                data-testid="app-row"
                data-app-id={app.id}
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : app.id)}
                  className="w-full grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_auto] items-center gap-4 px-4 md:px-6 min-h-[var(--row-h)] text-left hover:bg-[var(--accent-dim)] transition-colors duration-100"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center">
                    <MonoNumber size="lg" tone="muted">{idx}</MonoNumber>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] md:text-[17px] font-semibold text-[var(--t0)] truncate">
                      {app.job.title}
                    </div>
                    <div className="font-mono text-[12px] text-[var(--t1)] truncate mt-0.5">
                      {app.job.employer.companyName} · {app.job.location} · {timeAgo(app.appliedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {activeInterview && (
                      <span className="text-[10px] font-mono uppercase tracking-wide text-[var(--accent)]">
                        PV
                      </span>
                    )}
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

                {isExpanded && (
                  <div className="px-4 md:px-6 pb-6 pt-2 border-t border-[var(--border)]" data-testid="app-expanded">
                    <div className="flex gap-3 flex-wrap mt-3">
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[12px] text-[var(--accent)] hover:underline"
                      >
                        → xem CV đã nộp
                      </a>
                      <a
                        href={`/jobs/${app.job.id}`}
                        className="font-mono text-[12px] text-[var(--t1)] hover:text-[var(--t0)]"
                      >
                        → mở tin tuyển dụng
                      </a>
                    </div>

                    {app.coverLetter && (
                      <div className="mt-4">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--t2)] mb-1.5">
                          thư giới thiệu
                        </p>
                        <p className="text-[13px] text-[var(--t1)] leading-relaxed whitespace-pre-wrap">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}

                    {app.note && (
                      <div className="mt-4">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--t2)] mb-1.5">
                          ghi chú nhà tuyển dụng
                        </p>
                        <p className="text-[13px] text-[var(--t1)] leading-relaxed">{app.note}</p>
                      </div>
                    )}

                    {activeInterview && <InterviewBadge appId={app.id} interview={activeInterview} />}

                    <div className="mt-5">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--t2)] mb-2">
                        lịch sử trạng thái
                      </p>
                      <Timeline appId={app.id} />
                    </div>
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
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 text-[var(--t1)] hover:text-[var(--t0)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> prev
          </button>
          <span className="text-[var(--t2)] tabular-nums">
            page {page}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 text-[var(--t1)] hover:text-[var(--t0)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
