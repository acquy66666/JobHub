"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { queryKeys } from "@/lib/queryKeys";
import { formatJobType, formatWorkMode, formatSalary, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { Row } from "@/components/ui/Row";
import { MonoNumber } from "@/components/ui/MonoNumber";

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
    isVerified: boolean;
  };
}

function modeLabel(mode: string) {
  return formatWorkMode(mode).toLowerCase();
}

function typeLabel(t: string) {
  return formatJobType(t).toLowerCase();
}

export default function RecommendedJobsPage() {
  const { data: jobs = [], isLoading } = useQuery<RecommendedJob[]>({
    queryKey: queryKeys.recommendedJobs(20),
    queryFn: () => api.get("/candidate/recommended-jobs?limit=20").then((r) => r.data),
  });

  return (
    <div className="pb-10">
      <section className="px-4 md:px-6 py-8">
        <h1 className="text-[clamp(26px,3.5vw,36px)] font-medium tracking-tight text-[var(--t0)]">
          Việc làm phù hợp
        </h1>
        <p className="font-mono text-[13px] text-[var(--t1)] mt-2">
          {`> ${jobs.length} gợi ý · dựa trên kỹ năng + lịch sử ứng tuyển`}
        </p>
      </section>

      <HairlineSection label="DANH SÁCH">
        {isLoading ? (
          <p className="px-4 md:px-6 py-8 font-mono text-[13px] text-[var(--t2)]">đang tải…</p>
        ) : jobs.length === 0 ? (
          <div className="px-4 md:px-6 py-10 text-center">
            <p className="font-mono text-[13px] text-[var(--t2)]">
              Chưa có gợi ý phù hợp. Hoàn thiện hồ sơ + thêm kỹ năng để nhận gợi ý chính xác hơn.
            </p>
            <Link
              href="/candidate/profile"
              className="inline-block mt-3 font-mono text-[13px] text-[var(--accent)] hover:underline"
            >
              → cập nhật hồ sơ
            </Link>
          </div>
        ) : (
          jobs.map((job) => {
            const tone: "accent" | "default" | "muted" =
              job.matchScore >= 85 ? "accent" : job.matchScore >= 70 ? "default" : "muted";
            return (
              <Row key={job.id} as="a" href={`/jobs/${job.id}`}>
                <Row.Lead>
                  <MonoNumber size="lg" tone={tone}>{job.matchScore}</MonoNumber>
                </Row.Lead>
                <Row.Body
                  title={job.title}
                  meta={
                    <span className="font-mono text-[12px]">
                      {job.employer.companyName}
                      {job.employer.isVerified && " ✓"} · {job.location} · {modeLabel(job.workMode)} ·{" "}
                      {typeLabel(job.jobType)} · {timeAgo(job.createdAt)}
                    </span>
                  }
                />
                <Row.End>
                  <span className="font-mono text-[13px] text-[var(--t0)]">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                  </span>
                  {job.matchedSkills.length > 0 && (
                    <span className="font-mono text-[11px] text-green-400 hidden md:inline">
                      ✓ {job.matchedSkills.slice(0, 3).join(", ")}
                      {job.matchedSkills.length > 3 && ` +${job.matchedSkills.length - 3}`}
                    </span>
                  )}
                </Row.End>
              </Row>
            );
          })
        )}
      </HairlineSection>
    </div>
  );
}
