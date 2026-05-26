"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import { formatJobStatus, formatJobType, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  status: string;
  jobType: string;
  location: string;
  createdAt: string;
  expiresAt: string;
  _count: { applications: number };
}

export default function EmployerJobsPage() {
  const [page, setPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.employerJobs(page),
    queryFn: () => api.get("/employer/jobs", { params: { page, limit: 10 } }).then((r) => r.data),
  });

  const jobs: Job[] = data?.jobs ?? [];
  const totalPages = data?.totalPages ?? 1;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/employer/jobs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employerJobs(page) }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "pause" | "resume" }) =>
      api.patch(`/employer/jobs/${id}/status`, { action }),
    onMutate: async ({ id, action }) => {
      await qc.cancelQueries({ queryKey: queryKeys.employerJobs(page) });
      const previous = qc.getQueryData(queryKeys.employerJobs(page));
      qc.setQueryData(queryKeys.employerJobs(page), (old: Record<string, unknown> | undefined) => ({
        ...old,
        jobs: (old?.jobs as Job[] | undefined)?.map((j) =>
          j.id === id ? { ...j, status: action === "pause" ? "PAUSED" : "ACTIVE" } : j
        ) ?? [],
      }));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(queryKeys.employerJobs(page), ctx?.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.employerJobs(page) }),
  });

  return (
    <div className="p-8 max-w-5xl">
      <ScrollReveal direction="up" className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-extrabold text-t0 mb-1">Quản lý tin đăng</h1>
          <p className="text-[14px] text-t1">Xem và quản lý tất cả tin tuyển dụng của bạn.</p>
        </div>
        <Link href="/employer/jobs/new" className="btn-primary px-5 py-2.5 rounded-xl text-[14px] font-semibold">+ Đăng tin</Link>
      </ScrollReveal>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-bg-2 rounded-2xl animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card-dark p-12 rounded-2xl text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-[18px] font-bold text-t0 mb-2">Chưa có tin tuyển dụng</h3>
          <Link href="/employer/jobs/new" className="btn-primary px-6 py-2.5 rounded-xl text-[14px] inline-block">Đăng tin đầu tiên</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => {
            const { label, color } = formatJobStatus(job.status);
            return (
              <ScrollReveal key={job.id} direction="up" delay={i * 0.04}>
                <div className="card-dark p-5 rounded-2xl flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Link href={`/employer/jobs/${job.id}/applications`} className="text-[15px] font-bold text-t0 hover:text-white transition-colors truncate">
                        {job.title}
                      </Link>
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border shrink-0 ${color}`}>{label}</span>
                    </div>
                    <p className="text-[12px] text-t2">
                      {formatJobType(job.jobType)} · {job.location} · {job._count.applications} đơn · Đăng {timeAgo(job.createdAt)} · Hết hạn {new Date(job.expiresAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/employer/jobs/${job.id}/applications`} className="px-3 py-1.5 rounded-lg border border-border-dark text-[12px] text-t1 hover:bg-white/[.04] hover:text-t0 transition-colors">
                      Đơn ({job._count.applications})
                    </Link>
                    <Link href={`/employer/jobs/${job.id}/edit`} className="px-3 py-1.5 rounded-lg border border-border-dark text-[12px] text-t1 hover:bg-white/[.04] hover:text-t0 transition-colors">
                      Sửa
                    </Link>
                    {job.status === "ACTIVE" && (
                      <button onClick={() => toggleMutation.mutate({ id: job.id, action: "pause" })} className="px-3 py-1.5 rounded-lg border border-border-dark text-[12px] text-yellow-400 hover:bg-yellow-400/10 transition-colors">
                        Tạm dừng
                      </button>
                    )}
                    {job.status === "PAUSED" && (
                      <button onClick={() => toggleMutation.mutate({ id: job.id, action: "resume" })} className="px-3 py-1.5 rounded-lg border border-border-dark text-[12px] text-green-400 hover:bg-green-400/10 transition-colors">
                        Khôi phục
                      </button>
                    )}
                    {confirmDeleteId === job.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => { deleteMutation.mutate(job.id); setConfirmDeleteId(null); }} className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-[12px] text-red-400 hover:bg-red-500/25 transition-colors">Xóa thật</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 rounded-lg border border-border-dark text-[12px] text-t2 hover:text-t0 transition-colors">Hủy</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(job.id)} className="px-3 py-1.5 rounded-lg border border-red-500/20 text-[12px] text-red-400 hover:bg-red-400/10 transition-colors">Xóa</button>
                    )}
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
