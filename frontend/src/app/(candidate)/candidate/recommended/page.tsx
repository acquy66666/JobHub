"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { scoreColor } from "@/lib/matchScore";
import { formatJobType, formatWorkMode, formatSalary, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import Link from "next/link";

interface RecommendedJob {
  id: string;
  title: string;
  location: string;
  jobType: string;
  workMode: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  industry: string;
  createdAt: string;
  matchScore: number;
  matchedSkills: string[];
  employer: {
    id: string;
    companyName: string;
    logoUrl: string | null;
    isVerified: boolean;
  };
}

export default function RecommendedJobsPage() {
  const { data: jobs = [], isLoading } = useQuery<RecommendedJob[]>({
    queryKey: queryKeys.recommendedJobs(10),
    queryFn: () => api.get("/candidate/recommended-jobs?limit=10").then((r) => r.data),
  });

  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-6">
      <ScrollReveal direction="up">
        <div>
          <h1 className="text-[24px] font-extrabold text-t0 mb-1">Việc làm phù hợp</h1>
          <p className="text-[14px] text-t1">
            Gợi ý dựa trên kỹ năng, địa điểm và lịch sử ứng tuyển của bạn.
          </p>
        </div>
      </ScrollReveal>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-bg-2 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <ScrollReveal direction="up" delay={0.05}>
          <div className="bg-bg-2 border border-border-dark rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-[18px] font-bold text-t0 mb-2">Chưa có gợi ý phù hợp</h3>
            <p className="text-[14px] text-t1 mb-5">
              Hoàn thiện hồ sơ và thêm kỹ năng để nhận gợi ý chính xác hơn.
            </p>
            <Link href="/candidate/profile" className="btn-primary px-5 py-2 rounded-xl text-[13px] inline-block">
              Cập nhật hồ sơ →
            </Link>
          </div>
        </ScrollReveal>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job, i) => {
            const initial = job.employer.companyName?.[0]?.toUpperCase() ?? "?";
            const scoreClass = scoreColor(job.matchScore);
            return (
              <ScrollReveal key={job.id} direction="up" delay={i * 0.05}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="block bg-bg-2 border border-border-dark rounded-2xl p-5 hover:border-[rgba(124,58,237,.38)] hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-bg-3 flex items-center justify-center shrink-0">
                        {job.employer.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={job.employer.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span className="text-[15px] font-black gradient-text">{initial}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-t2 truncate">
                          {job.employer.companyName}
                          {job.employer.isVerified && <span className="ml-1 text-blue-400">✓</span>}
                        </p>
                        <p className="text-[14px] font-bold text-t0 truncate group-hover:text-[#9D5CF6] transition-colors">
                          {job.title}
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-md border ${scoreClass}`}>
                      {job.matchScore}%
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="badge-type text-[10px]">{formatJobType(job.jobType)}</span>
                    <span className="badge-mode text-[10px]">{formatWorkMode(job.workMode)}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-bg-3 text-t2 border border-border-dark">
                      📍 {job.location}
                    </span>
                  </div>

                  <p className="text-[12px] text-green-400 font-medium mb-3">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                  </p>

                  {job.matchedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {job.matchedSkills.slice(0, 4).map(skill => (
                        <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(34,197,94,.08)] text-green-400 border border-[rgba(34,197,94,.15)]">
                          ✓ {skill}
                        </span>
                      ))}
                      {job.matchedSkills.length > 4 && (
                        <span className="text-[10px] text-t2">+{job.matchedSkills.length - 4}</span>
                      )}
                    </div>
                  )}

                  <p className="text-[10px] text-t2 mt-3">{timeAgo(job.createdAt)}</p>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
