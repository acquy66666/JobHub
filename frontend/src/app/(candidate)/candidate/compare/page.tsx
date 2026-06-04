"use client";
import { useEffect, useState } from "react";
import { useCompareStore } from "@/store/compareStore";
import { useQueries, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { formatSalary, formatJobType, formatWorkMode } from "@/lib/formatters";
import { computeMatchScore, scoreColor } from "@/lib/matchScore";
import { ApplyModal } from "@/components/jobs/ApplyModal";
import { ScrollReveal } from "@/components/common/ScrollReveal";

interface JobDetail {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits: string | null;
  location: string;
  jobType: string;
  workMode: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  experience: string | null;
  industry: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  employer: {
    id: string;
    companyName: string;
    logoUrl: string | null;
    isVerified: boolean;
  };
}

interface CandidateProfile {
  skills: string[];
}

interface ApplyTarget {
  id: string;
  title: string;
}

export default function ComparePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { compareJobs, removeJob, clearJobs } = useCompareStore();
  const { user } = useAuthStore();
  const [applyTarget, setApplyTarget] = useState<ApplyTarget | null>(null);

  const { data: profile } = useQuery<CandidateProfile>({
    queryKey: queryKeys.candidateProfile(),
    queryFn: () => api.get("/candidate/profile").then((r) => r.data),
    enabled: user?.role === "CANDIDATE",
  });

  const jobQueries = useQueries({
    queries: (mounted ? compareJobs : []).map((j) => ({
      queryKey: queryKeys.job(j.id),
      queryFn: () => api.get(`/jobs/${j.id}`).then((r) => r.data as JobDetail),
      staleTime: 5 * 60_000,
    })),
  });

  if (!mounted) return null;

  if (compareJobs.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="text-6xl">⚖️</div>
        <h1 className="text-[22px] font-bold text-t0">Chưa có việc làm để so sánh</h1>
        <p className="text-[14px] text-t1 max-w-md leading-relaxed">
          Vào trang <Link href="/jobs" className="text-[#B09BF8] hover:underline">Tìm việc làm</Link> và nhấn nút <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-bg-3 border border-border-dark text-[13px] mx-1">⚖</span> trên thẻ việc để thêm vào danh sách so sánh (tối đa 3 việc).
        </p>
        <Link href="/jobs" className="btn-primary px-6 py-2.5 rounded-xl text-[14px] font-semibold mt-2">
          Tìm việc làm →
        </Link>
      </div>
    );
  }

  const isLoading = jobQueries.some((q) => q.isLoading);
  const jobs = jobQueries.map((q) => q.data).filter((j): j is JobDetail => !!j);
  const candidateSkills: string[] = profile?.skills ?? [];

  const ROWS: { label: string; render: (job: JobDetail) => React.ReactNode }[] = [
    {
      label: "Mức lương",
      render: (job) => (
        <span className="text-[13px] text-[#4ADE80] font-semibold">
          {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
        </span>
      ),
    },
    {
      label: "Địa điểm",
      render: (job) => <span className="text-[13px] text-t0">{job.location}</span>,
    },
    {
      label: "Hình thức",
      render: (job) => <span className="badge-type">{formatJobType(job.jobType)}</span>,
    },
    {
      label: "Chế độ",
      render: (job) => <span className="badge-mode">{formatWorkMode(job.workMode)}</span>,
    },
    {
      label: "Ngành",
      render: (job) => <span className="text-[13px] text-t1">{job.industry}</span>,
    },
    {
      label: "Kinh nghiệm",
      render: (job) => (
        <span className="text-[13px] text-t1">{job.experience ?? "Không yêu cầu"}</span>
      ),
    },
  ];

  if (user?.role === "CANDIDATE") {
    ROWS.push({
      label: "Match score",
      render: (job) => {
        const result = computeMatchScore(candidateSkills, job.requirements);
        return (
          <span
            className={`inline-flex items-center text-[12px] font-bold px-2.5 py-1 rounded-lg border ${scoreColor(result.score)}`}
          >
            {result.score}% phù hợp
          </span>
        );
      },
    });
    ROWS.push({
      label: "Kỹ năng",
      render: (job) => {
        if (candidateSkills.length === 0) {
          return <span className="text-[12px] text-t2">Chưa cập nhật kỹ năng</span>;
        }
        const result = computeMatchScore(candidateSkills, job.requirements);
        return (
          <div className="flex flex-wrap gap-1">
            {result.matched.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[rgba(34,197,94,.1)] text-[#4ADE80] border border-[rgba(34,197,94,.2)]"
              >
                {s}
              </span>
            ))}
            {result.unmatched.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-bg-3 text-t2 border border-border-dark"
              >
                {s}
              </span>
            ))}
          </div>
        );
      },
    });
  }

  ROWS.push({
    label: "Hạn nộp",
    render: (job) => (
      <span className="text-[13px] text-t1">
        {new Date(job.expiresAt).toLocaleDateString("vi-VN", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  });

  const minWidth = 160 + jobs.length * 260;

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-extrabold text-t0">So sánh việc làm</h1>
            <p className="text-[14px] text-t1 mt-1">
              Đang so sánh {compareJobs.length} việc làm
            </p>
          </div>
          <button
            onClick={clearJobs}
            className="px-4 py-2 rounded-xl border border-border-dark text-[13px] text-t1 hover:text-[#EF4444] hover:border-[rgba(239,68,68,.3)] transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      </ScrollReveal>

      {isLoading ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${compareJobs.length}, 1fr)` }}>
          {compareJobs.map((j) => (
            <div key={j.id} className="h-40 rounded-2xl bg-bg-2 border border-border-dark animate-pulse" />
          ))}
        </div>
      ) : (
        <ScrollReveal direction="up" delay={0.05}>
          <div className="overflow-x-auto rounded-2xl border border-border-dark">
            <table className="w-full" style={{ minWidth: `${minWidth}px` }}>
              {/* Job header cards */}
              <thead>
                <tr className="border-b border-border-dark bg-bg-2">
                  <th className="p-4 text-left w-40">
                    <span className="text-[11px] font-semibold text-t2 uppercase tracking-wide">
                      Tiêu chí
                    </span>
                  </th>
                  {jobs.map((job) => (
                    <th key={job.id} className="p-4 text-left border-l border-border-dark">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-bg-3 flex items-center justify-center">
                          {job.employer.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={job.employer.logoUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[14px] font-black gradient-text">
                              {job.employer.companyName[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="text-[13px] font-bold text-t0 hover:text-[#B09BF8] transition-colors line-clamp-2"
                          >
                            {job.title}
                          </Link>
                          <p className="text-[11px] text-t2 mt-0.5">{job.employer.companyName}</p>
                        </div>
                        <button
                          onClick={() => removeJob(job.id)}
                          className="shrink-0 text-t2 hover:text-[#EF4444] transition-colors"
                          title="Bỏ khỏi so sánh"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {ROWS.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-border-dark last:border-0 hover:bg-white/[.02] transition-colors"
                  >
                    <td className="p-4 w-40 align-top">
                      <span className="text-[12px] font-semibold text-t2">{row.label}</span>
                    </td>
                    {jobs.map((job) => (
                      <td key={job.id} className="p-4 border-l border-border-dark align-top">
                        {row.render(job)}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Action row — candidate only */}
                {user?.role === "CANDIDATE" && (
                  <tr className="border-t border-border-dark bg-bg-2/50">
                    <td className="p-4">
                      <span className="text-[12px] font-semibold text-t2">Thao tác</span>
                    </td>
                    {jobs.map((job) => (
                      <td key={job.id} className="p-4 border-l border-border-dark">
                        <button
                          onClick={() => setApplyTarget({ id: job.id, title: job.title })}
                          className="btn-primary px-4 py-2 rounded-xl text-[12px] font-semibold"
                        >
                          Nộp đơn
                        </button>
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      )}

      {applyTarget && (
        <ApplyModal
          jobId={applyTarget.id}
          jobTitle={applyTarget.title}
          isOpen={!!applyTarget}
          onClose={() => setApplyTarget(null)}
        />
      )}
    </div>
  );
}
