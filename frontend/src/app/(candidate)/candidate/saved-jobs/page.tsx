"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import { JobCard } from "@/components/jobs/JobCard";
import api from "@/lib/api";

type GapResponse = {
  jobId: string;
  jobTitle: string;
  skills: { required: string[]; have: string[]; missing: string[] };
  experience: { required: number | null; have: number | null; met: boolean; shortBy: number; tier: string };
  certificates: {
    required: string[];
    have: string[];
    missing: string[];
    meta: Array<{ slug: string; nameVi: string; nameEn: string | null; issuer: string }>;
  };
};

export default function SavedJobsPage() {
  const [page, setPage] = useState(1);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
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
        <p className="text-[14px] text-t1">Các tin tuyển dụng bạn đã đánh dấu yêu thích. Mở rộng để xem khoảng cách hồ sơ.</p>
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
          <div className="space-y-4">
            {savedJobs.map((item: { job: Parameters<typeof JobCard>[0]['job'] }, i: number) => {
              const isExpanded = expandedJobId === item.job.id;
              return (
                <ScrollReveal key={item.job.id} direction="up" delay={i * 0.05}>
                  <div data-testid="saved-job-row" data-job-id={item.job.id}>
                    <JobCard
                      job={item.job}
                      isSaved
                      onUnsave={(jobId) => unsaveMutation.mutate(jobId)}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        data-testid="gap-toggle-btn"
                        onClick={() => setExpandedJobId(isExpanded ? null : item.job.id)}
                        className="text-[12px] px-3 py-1.5 rounded-lg border border-[rgba(124,58,237,.3)] text-[#B09BF8] hover:bg-[rgba(124,58,237,.1)] transition-colors"
                      >
                        {isExpanded ? "Ẩn phân tích gap" : "Xem gap với hồ sơ"}
                      </button>
                    </div>
                    {isExpanded && <GapPanel jobId={item.job.id} />}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

function GapPanel({ jobId }: { jobId: string }) {
  const { data, isLoading, isError } = useQuery<GapResponse>({
    queryKey: ["candidate", "saved-jobs", jobId, "gap"],
    queryFn: () => api.get(`/candidate/saved-jobs/${jobId}/gap`).then((r) => r.data),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div data-testid="gap-panel" className="mt-3 card-dark p-5 rounded-2xl">
        <p className="text-[13px] text-t2">Đang phân tích khoảng cách...</p>
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div data-testid="gap-panel" className="mt-3 card-dark p-5 rounded-2xl">
        <p className="text-[13px] text-red-400">Không tải được dữ liệu gap.</p>
      </div>
    );
  }

  const certMeta = new Map(data.certificates.meta.map((c) => [c.slug, c]));
  const skillsAllMet = data.skills.missing.length === 0 && data.skills.required.length > 0;
  const expMet = data.experience.met;
  const certsAllMet = data.certificates.missing.length === 0 && data.certificates.required.length > 0;

  return (
    <div data-testid="gap-panel" className="mt-3 card-dark p-5 rounded-2xl space-y-4">
      <h3 className="text-[14px] font-bold text-t0">Phân tích khoảng cách hồ sơ</h3>

      <section data-testid="gap-skills">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-t2">Kỹ năng</span>
          {data.skills.required.length === 0 ? (
            <span className="text-[11px] text-t2">Tin chưa yêu cầu kỹ năng cụ thể</span>
          ) : skillsAllMet ? (
            <span className="text-[11px] text-green-400">✓ Đủ {data.skills.required.length}/{data.skills.required.length}</span>
          ) : (
            <span className="text-[11px] text-yellow-400">Thiếu {data.skills.missing.length}/{data.skills.required.length}</span>
          )}
        </div>
        {data.skills.required.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.skills.have.map((s) => (
              <span key={s} data-cert-have-slug={s} className="px-2 py-0.5 rounded-md bg-[rgba(34,197,94,.12)] border border-[rgba(34,197,94,.25)] text-[11px] text-green-400">
                ✓ {s}
              </span>
            ))}
            {data.skills.missing.map((s) => (
              <span key={s} data-skill-missing-slug={s} className="px-2 py-0.5 rounded-md bg-[rgba(245,158,11,.12)] border border-[rgba(245,158,11,.25)] text-[11px] text-yellow-300">
                ⚠ {s}
              </span>
            ))}
          </div>
        )}
      </section>

      <section data-testid="gap-experience">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-t2">Kinh nghiệm</span>
          {data.experience.required === null ? (
            <span className="text-[11px] text-t2">Tin không yêu cầu kinh nghiệm</span>
          ) : expMet ? (
            <span className="text-[11px] text-green-400">✓ Đạt ({data.experience.have ?? 0}/{data.experience.required} năm)</span>
          ) : (
            <span className="text-[11px] text-yellow-400">Thiếu {data.experience.shortBy} năm ({data.experience.have ?? 0}/{data.experience.required})</span>
          )}
        </div>
      </section>

      <section data-testid="gap-certificates">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-t2">Chứng chỉ</span>
          {data.certificates.required.length === 0 ? (
            <span className="text-[11px] text-t2">Tin không yêu cầu chứng chỉ</span>
          ) : certsAllMet ? (
            <span className="text-[11px] text-green-400">✓ Đủ {data.certificates.required.length}/{data.certificates.required.length}</span>
          ) : (
            <span className="text-[11px] text-yellow-400">Thiếu {data.certificates.missing.length}/{data.certificates.required.length}</span>
          )}
        </div>
        {data.certificates.required.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.certificates.have.map((slug) => (
              <span key={slug} className="px-2 py-0.5 rounded-md bg-[rgba(34,197,94,.12)] border border-[rgba(34,197,94,.25)] text-[11px] text-green-400">
                ✓ {certMeta.get(slug)?.nameVi ?? slug}
              </span>
            ))}
            {data.certificates.missing.map((slug) => (
              <span key={slug} data-cert-missing-slug={slug} className="px-2 py-0.5 rounded-md bg-[rgba(245,158,11,.12)] border border-[rgba(245,158,11,.25)] text-[11px] text-yellow-300">
                ⚠ {certMeta.get(slug)?.nameVi ?? slug}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
