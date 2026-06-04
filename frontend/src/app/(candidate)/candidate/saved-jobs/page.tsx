"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import { JobCard } from "@/components/jobs/JobCard";
import api from "@/lib/api";

export default function SavedJobsPage() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.candidateSavedJobs(page),
    queryFn: () => api.get("/candidate/saved-jobs", { params: { page, limit: 9 } }).then((r) => r.data),
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId: string) => api.delete(`/candidate/saved-jobs/${jobId}`),
    onMutate: async (jobId) => {
      await qc.cancelQueries({ queryKey: queryKeys.candidateSavedJobs(page) });
      const previous = qc.getQueryData(queryKeys.candidateSavedJobs(page));
      qc.setQueryData(queryKeys.candidateSavedJobs(page), (old: Record<string, unknown> | undefined) => ({
        ...old,
        savedJobs: (old?.savedJobs as { job: { id: string } }[] | undefined)?.filter((item) => item.job.id !== jobId) ?? [],
      }));
      return { previous };
    },
    onError: (_err, _jobId, ctx) => {
      qc.setQueryData(queryKeys.candidateSavedJobs(page), ctx?.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.candidateSavedJobs(page) }),
  });

  const savedJobs = data?.savedJobs ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-4 sm:p-8 max-w-5xl space-y-6">
      <ScrollReveal direction="up">
        <h1 className="text-[24px] font-extrabold text-t0 mb-1">Việc làm đã lưu</h1>
        <p className="text-[14px] text-t1">Các tin tuyển dụng bạn đã đánh dấu yêu thích.</p>
      </ScrollReveal>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-bg-2 rounded-2xl animate-pulse" />)}
        </div>
      ) : savedJobs.length === 0 ? (
        <ScrollReveal direction="up" delay={0.05}>
          <div className="card-dark p-12 rounded-2xl text-center">
            <div className="text-5xl mb-4">🔖</div>
            <h3 className="text-[18px] font-bold text-t0 mb-2">Chưa có việc làm đã lưu</h3>
            <p className="text-[14px] text-t1">Lưu các tin tuyển dụng yêu thích để xem lại sau.</p>
          </div>
        </ScrollReveal>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedJobs.map((item: { job: Parameters<typeof JobCard>[0]['job'] }, i: number) => (
              <ScrollReveal key={item.job.id} direction="up" delay={i * 0.05}>
                <JobCard
                  job={item.job}
                  isSaved
                  onUnsave={(jobId) => unsaveMutation.mutate(jobId)}
                />
              </ScrollReveal>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
