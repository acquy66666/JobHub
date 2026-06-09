"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import { formatSalary, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { MonoNumber } from "@/components/ui/MonoNumber";

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

interface SavedItem {
  job: {
    id: string;
    title: string;
    location: string;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string;
    createdAt: string;
    employer: { companyName: string };
  };
}

export default function SavedJobsPage() {
  const [page, setPage] = useState(1);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.candidateSavedJobs(page),
    queryFn: () => api.get("/candidate/saved-jobs", { params: { page, limit: 20 } }).then((r) => r.data),
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId: string) => api.delete(`/candidate/saved-jobs/${jobId}`),
    onMutate: async (jobId) => {
      await qc.cancelQueries({ queryKey: queryKeys.candidateSavedJobs(page) });
      const previous = qc.getQueryData(queryKeys.candidateSavedJobs(page));
      qc.setQueryData(queryKeys.candidateSavedJobs(page), (old: Record<string, unknown> | undefined) => ({
        ...old,
        savedJobs:
          (old?.savedJobs as { job: { id: string } }[] | undefined)?.filter(
            (item) => item.job.id !== jobId,
          ) ?? [],
      }));
      return { previous };
    },
    onError: (_err, _jobId, ctx) => {
      qc.setQueryData(queryKeys.candidateSavedJobs(page), ctx?.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.candidateSavedJobs(page) }),
  });

  const savedJobs: SavedItem[] = data?.savedJobs ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="pb-10">
      <section className="px-4 md:px-6 py-8">
        <h1 className="text-[clamp(26px,3.5vw,36px)] font-medium tracking-tight text-[var(--t0)]">
          Việc làm đã lưu
        </h1>
        <p className="font-mono text-[13px] text-[var(--t1)] mt-2">
          {`> ${total} tin · click row để xem gap với hồ sơ`}
        </p>
      </section>

      <HairlineSection label="DANH SÁCH">
        {isLoading ? (
          <p className="px-4 md:px-6 py-8 font-mono text-[13px] text-[var(--t2)]">đang tải…</p>
        ) : savedJobs.length === 0 ? (
          <div className="px-4 md:px-6 py-10 text-center">
            <p className="font-mono text-[13px] text-[var(--t2)]">Bạn chưa lưu tin tuyển dụng nào.</p>
            <a
              href="/jobs"
              className="inline-block mt-3 font-mono text-[13px] text-[var(--accent)] hover:underline"
            >
              → tìm việc
            </a>
          </div>
        ) : (
          savedJobs.map(({ job }, i) => {
            const isExpanded = expandedJobId === job.id;
            const idx = String((page - 1) * 20 + i + 1).padStart(2, "0");
            return (
              <div
                key={job.id}
                className={`border-b border-[var(--border)] border-l-2 ${
                  isExpanded ? "border-l-[var(--accent)] bg-[var(--accent-dim)]" : "border-l-transparent"
                }`}
                data-testid="saved-job-row"
                data-job-id={job.id}
              >
                <button
                  type="button"
                  data-testid="gap-toggle-btn"
                  onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                  className="w-full grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_auto] items-center gap-4 px-4 md:px-6 min-h-[var(--row-h)] text-left hover:bg-[var(--accent-dim)] transition-colors duration-100"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center">
                    <MonoNumber size="lg" tone="muted">{idx}</MonoNumber>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] md:text-[17px] font-semibold text-[var(--t0)] truncate">
                      {job.title}
                    </div>
                    <div className="font-mono text-[12px] text-[var(--t1)] truncate mt-0.5">
                      {job.employer.companyName} · {job.location} · {timeAgo(job.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[13px] text-[var(--t0)] hidden sm:inline">
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--t2)] transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 md:px-6 pb-6 pt-2 border-t border-[var(--border)]">
                    <div className="flex gap-4 flex-wrap mt-3 font-mono text-[12px]">
                      <a
                        href={`/jobs/${job.id}`}
                        className="text-[var(--accent)] hover:underline"
                      >
                        → mở tin tuyển dụng
                      </a>
                      <button
                        type="button"
                        onClick={() => unsaveMutation.mutate(job.id)}
                        className="text-[var(--t1)] hover:text-red-400 transition-colors"
                      >
                        → bỏ lưu
                      </button>
                    </div>
                    <GapPanel jobId={job.id} />
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

function GapPanel({ jobId }: { jobId: string }) {
  const { data, isLoading, isError } = useQuery<GapResponse>({
    queryKey: ["candidate", "saved-jobs", jobId, "gap"],
    queryFn: () => api.get(`/candidate/saved-jobs/${jobId}/gap`).then((r) => r.data),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div data-testid="gap-panel" className="mt-5">
        <p className="font-mono text-[12px] text-[var(--t2)]">đang phân tích khoảng cách…</p>
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div data-testid="gap-panel" className="mt-5">
        <p className="font-mono text-[12px] text-red-400">không tải được dữ liệu gap.</p>
      </div>
    );
  }

  const certMeta = new Map(data.certificates.meta.map((c) => [c.slug, c]));
  const skillsAllMet = data.skills.missing.length === 0 && data.skills.required.length > 0;
  const expMet = data.experience.met;
  const certsAllMet = data.certificates.missing.length === 0 && data.certificates.required.length > 0;

  return (
    <div data-testid="gap-panel" className="mt-5 space-y-5">
      <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--t2)]">
        phân tích khoảng cách hồ sơ
      </p>

      <section data-testid="gap-skills">
        <div className="flex items-center justify-between mb-2 font-mono text-[12px]">
          <span className="text-[var(--t2)] uppercase tracking-wide">kỹ năng</span>
          {data.skills.required.length === 0 ? (
            <span className="text-[var(--t2)]">tin chưa yêu cầu kỹ năng</span>
          ) : skillsAllMet ? (
            <span className="text-green-400">
              ✓ đủ {data.skills.required.length}/{data.skills.required.length}
            </span>
          ) : (
            <span className="text-yellow-400">
              thiếu {data.skills.missing.length}/{data.skills.required.length}
            </span>
          )}
        </div>
        {data.skills.required.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[12px]">
            {data.skills.have.map((s) => (
              <span key={s} data-cert-have-slug={s} className="text-green-400">
                ✓ {s}
              </span>
            ))}
            {data.skills.missing.map((s) => (
              <span key={s} data-skill-missing-slug={s} className="text-yellow-400">
                ⚠ {s}
              </span>
            ))}
          </div>
        )}
      </section>

      <section data-testid="gap-experience" className="font-mono text-[12px]">
        <div className="flex items-center justify-between">
          <span className="text-[var(--t2)] uppercase tracking-wide">kinh nghiệm</span>
          {data.experience.required === null ? (
            <span className="text-[var(--t2)]">không yêu cầu</span>
          ) : expMet ? (
            <span className="text-green-400">
              ✓ đạt ({data.experience.have ?? 0}/{data.experience.required} năm)
            </span>
          ) : (
            <span className="text-yellow-400">
              thiếu {data.experience.shortBy} năm ({data.experience.have ?? 0}/{data.experience.required})
            </span>
          )}
        </div>
      </section>

      <section data-testid="gap-certificates">
        <div className="flex items-center justify-between mb-2 font-mono text-[12px]">
          <span className="text-[var(--t2)] uppercase tracking-wide">chứng chỉ</span>
          {data.certificates.required.length === 0 ? (
            <span className="text-[var(--t2)]">không yêu cầu</span>
          ) : certsAllMet ? (
            <span className="text-green-400">
              ✓ đủ {data.certificates.required.length}/{data.certificates.required.length}
            </span>
          ) : (
            <span className="text-yellow-400">
              thiếu {data.certificates.missing.length}/{data.certificates.required.length}
            </span>
          )}
        </div>
        {data.certificates.required.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[12px]">
            {data.certificates.have.map((slug) => (
              <span key={slug} className="text-green-400">
                ✓ {certMeta.get(slug)?.nameVi ?? slug}
              </span>
            ))}
            {data.certificates.missing.map((slug) => (
              <span key={slug} data-cert-missing-slug={slug} className="text-yellow-400">
                ⚠ {certMeta.get(slug)?.nameVi ?? slug}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
