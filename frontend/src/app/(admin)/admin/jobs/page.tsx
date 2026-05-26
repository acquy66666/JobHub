"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import { formatJobStatus, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";

interface AdminJob {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  employer: { id: string; companyName: string; logoUrl: string | null };
  _count: { applications: number };
}

const STATUS_TABS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "ACTIVE", label: "Đang tuyển" },
  { value: "REJECTED", label: "Bị từ chối" },
];

export default function AdminJobsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const qc = useQueryClient();

  const params = { page, limit: 15, ...(status ? { status } : {}) };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminJobs(params),
    queryFn: () => api.get("/admin/jobs", { params }).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (jobId: string) => api.patch(`/admin/jobs/${jobId}/status`, { status: "ACTIVE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminJobs() }),
  });

  const rejectMutation = useMutation({
    mutationFn: (jobId: string) => api.patch(`/admin/jobs/${jobId}/status`, { status: "REJECTED" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminJobs() }),
  });

  const jobs: AdminJob[] = data?.jobs ?? [];
  const totalPages: number = data?.totalPages ?? 1;

  function handleTabChange(value: string) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="p-8 max-w-5xl">
      <ScrollReveal direction="up" className="mb-6">
        <h1 className="text-[28px] font-extrabold text-t0 tracking-tight">Duyệt tin tuyển dụng</h1>
        <p className="text-[15px] text-t1 mt-1">Xem xét và phê duyệt các tin đăng từ nhà tuyển dụng.</p>
      </ScrollReveal>

      {/* Filter tabs */}
      <ScrollReveal direction="up" delay={0.05} className="mb-5">
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-2 rounded-xl text-[13px] font-medium border transition-colors ${
                status === tab.value
                  ? "bg-[rgba(124,58,237,.15)] border-[rgba(124,58,237,.4)] text-[#B09BF8]"
                  : "bg-transparent border-border-dark text-t1 hover:border-[rgba(124,58,237,.3)] hover:text-t0"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Table */}
      <ScrollReveal direction="up" delay={0.08}>
        <div className="card-dark rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-border-dark">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <div className="h-4 bg-bg-3 rounded animate-pulse flex-1" />
                  <div className="h-4 bg-bg-3 rounded animate-pulse w-24" />
                  <div className="h-4 bg-bg-3 rounded animate-pulse w-20" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[14px] text-t2">Không có tin nào.</p>
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {/* Header */}
              <div className="grid grid-cols-[1fr_180px_100px_120px_160px] gap-4 px-5 py-3 text-[11px] font-semibold text-t2 uppercase tracking-wider">
                <span>Tiêu đề</span>
                <span>Công ty</span>
                <span>Đơn</span>
                <span>Trạng thái</span>
                <span>Thao tác</span>
              </div>
              {jobs.map((job) => {
                const { label, color } = formatJobStatus(job.status);
                const isPending = job.status === "PENDING";
                return (
                  <div key={job.id} className="grid grid-cols-[1fr_180px_100px_120px_160px] gap-4 px-5 py-4 items-center hover:bg-white/[.02] transition-colors">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-t0 truncate">{job.title}</p>
                      <p className="text-[11px] text-t2">{timeAgo(job.createdAt)}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] text-t1 truncate">{job.employer.companyName}</p>
                    </div>
                    <div>
                      <p className="text-[13px] text-t1">{job._count.applications}</p>
                    </div>
                    <div>
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${color}`}>{label}</span>
                    </div>
                    <div className="flex gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => approveMutation.mutate(job.id)}
                            disabled={approveMutation.isPending}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[rgba(34,197,94,.12)] text-green-400 border border-green-500/20 hover:bg-[rgba(34,197,94,.2)] transition-colors disabled:opacity-50"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate(job.id)}
                            disabled={rejectMutation.isPending}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[rgba(239,68,68,.12)] text-red-400 border border-red-500/20 hover:bg-[rgba(239,68,68,.2)] transition-colors disabled:opacity-50"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollReveal>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
