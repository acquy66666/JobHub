"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import { formatJobStatus, formatJobType, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import { useToast } from "@/store/toastStore";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { MonoNumber } from "@/components/ui/MonoNumber";

interface Job {
  id: string;
  title: string;
  status: string;
  jobType: string;
  location: string;
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  _count: { applications: number };
}

export default function EmployerJobsPage() {
  const [page, setPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.employerJobs(page),
    queryFn: () => api.get("/employer/jobs", { params: { page, limit: 10 } }).then((r) => r.data),
  });

  const jobs: Job[] = data?.jobs ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/employer/jobs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.employerJobs(page) });
      toast.info("Đã xóa tin tuyển dụng");
    },
    onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "pause" | "resume" }) =>
      api.patch(`/employer/jobs/${id}/status`, { action }),
    onMutate: async ({ id, action }) => {
      await qc.cancelQueries({ queryKey: queryKeys.employerJobs(page) });
      const previous = qc.getQueryData(queryKeys.employerJobs(page));
      qc.setQueryData(queryKeys.employerJobs(page), (old: Record<string, unknown> | undefined) => ({
        ...old,
        jobs:
          (old?.jobs as Job[] | undefined)?.map((j) =>
            j.id === id ? { ...j, status: action === "pause" ? "PAUSED" : "ACTIVE" } : j,
          ) ?? [],
      }));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(queryKeys.employerJobs(page), ctx?.previous);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    },
    onSuccess: (_data, { action }) => {
      if (action === "pause") toast.info("Đã tạm dừng tin tuyển dụng");
      else toast.success("Đã khôi phục tin tuyển dụng");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.employerJobs(page) }),
  });

  return (
    <div className="pb-10">
      <section className="px-4 md:px-6 py-8 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[clamp(26px,3.5vw,36px)] font-medium tracking-tight text-[var(--t0)]">
            Tin tuyển dụng
          </h1>
          <p className="font-mono text-[13px] text-[var(--t1)] mt-2">
            {`> ${total} tin · trang ${page}/${totalPages}`}
          </p>
        </div>
        <Link
          href="/employer/jobs/new"
          className="font-mono text-[13px] px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-sharp hover:bg-[var(--accent-dim)] transition-colors"
        >
          + tin mới
        </Link>
      </section>

      <HairlineSection label="DANH SÁCH TIN">
        {isLoading ? (
          <p className="px-4 md:px-6 py-8 font-mono text-[13px] text-[var(--t2)]">đang tải…</p>
        ) : jobs.length === 0 ? (
          <div className="px-4 md:px-6 py-10 text-center">
            <p className="font-mono text-[13px] text-[var(--t2)]">Bạn chưa đăng tin tuyển dụng nào.</p>
            <Link
              href="/employer/jobs/new"
              className="inline-block mt-3 font-mono text-[13px] text-[var(--accent)] hover:underline"
            >
              → đăng tin đầu tiên
            </Link>
          </div>
        ) : (
          jobs.map((job, i) => {
            const { label, color } = formatJobStatus(job.status);
            const idx = String((page - 1) * 10 + i + 1).padStart(2, "0");
            const isExpanded = expanded === job.id;
            const cr = job.viewCount > 0 ? Math.round((job._count.applications / job.viewCount) * 100) : 0;
            return (
              <div
                key={job.id}
                className={`border-b border-[var(--border)] border-l-2 ${
                  isExpanded ? "border-l-[var(--accent)] bg-[var(--accent-dim)]" : "border-l-transparent"
                }`}
                data-testid="employer-job-row"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : job.id)}
                  aria-expanded={isExpanded}
                  className="w-full grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_auto] items-center gap-4 px-4 md:px-6 min-h-[var(--row-h)] text-left hover:bg-[var(--accent-dim)] transition-colors"
                >
                  <MonoNumber size="lg" tone="muted">
                    {idx}
                  </MonoNumber>
                  <div className="min-w-0">
                    <div className="text-[15px] md:text-[17px] font-semibold text-[var(--t0)] truncate">
                      {job.title}
                    </div>
                    <div className="font-mono text-[12px] text-[var(--t1)] truncate mt-0.5">
                      {formatJobType(job.jobType)} · {job.location} · {timeAgo(job.createdAt)} · {job.viewCount} views ·{" "}
                      {job._count.applications} đơn ({cr}% CR)
                    </div>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-sharp border ${color}`}>{label}</span>
                </button>

                {isExpanded && (
                  <div className="px-4 md:px-6 pb-5 pt-2 border-t border-[var(--border)]">
                    <div className="flex flex-wrap gap-3 mt-3 font-mono text-[12px]">
                      <Link
                        href={`/employer/jobs/${job.id}/applications`}
                        className="text-[var(--accent)] hover:underline"
                      >
                        → đơn ứng tuyển ({job._count.applications})
                      </Link>
                      <Link
                        href={`/employer/jobs/${job.id}/screening`}
                        className="text-[var(--t1)] hover:text-[var(--t0)]"
                      >
                        → câu hỏi sàng lọc
                      </Link>
                      <Link href={`/employer/jobs/${job.id}/edit`} className="text-[var(--t1)] hover:text-[var(--t0)]">
                        → sửa tin
                      </Link>
                      <Link href={`/jobs/${job.id}`} className="text-[var(--t1)] hover:text-[var(--t0)]">
                        → xem trang công khai
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.status === "ACTIVE" && (
                        <button
                          onClick={() => toggleMutation.mutate({ id: job.id, action: "pause" })}
                          className="px-3 py-1.5 rounded-sharp border border-yellow-400/40 text-yellow-400 text-[12px] hover:bg-yellow-400/10 transition-colors"
                        >
                          ⏸ tạm dừng
                        </button>
                      )}
                      {job.status === "PAUSED" && (
                        <button
                          onClick={() => toggleMutation.mutate({ id: job.id, action: "resume" })}
                          className="px-3 py-1.5 rounded-sharp border border-green-400/40 text-green-400 text-[12px] hover:bg-green-400/10 transition-colors"
                        >
                          ▶ khôi phục
                        </button>
                      )}
                      {confirmDeleteId === job.id ? (
                        <>
                          <button
                            onClick={() => {
                              deleteMutation.mutate(job.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-3 py-1.5 rounded-sharp bg-red-500/15 border border-red-500/40 text-red-400 text-[12px] hover:bg-red-500/25 transition-colors"
                          >
                            ✕ xoá thật
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1.5 rounded-sharp border border-[var(--border)] text-[var(--t2)] text-[12px] hover:text-[var(--t0)] transition-colors"
                          >
                            huỷ
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(job.id)}
                          className="px-3 py-1.5 rounded-sharp border border-red-500/30 text-red-400 text-[12px] hover:bg-red-500/10 transition-colors"
                        >
                          xoá
                        </button>
                      )}
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
            className="inline-flex items-center gap-1.5 text-[var(--t1)] hover:text-[var(--t0)] disabled:opacity-30"
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
            className="inline-flex items-center gap-1.5 text-[var(--t1)] hover:text-[var(--t0)] disabled:opacity-30"
          >
            next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
