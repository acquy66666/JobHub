"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { SectionTag } from "@/components/common/SectionTag";
import api from "@/lib/api";
import { formatSalary, formatJobType, formatWorkMode, timeAgo } from "@/lib/formatters";

interface VipJob {
  id: string;
  title: string;
  location: string;
  jobType: string;
  workMode: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  industry: string;
  createdAt: string;
  tier: "BASIC" | "PREMIUM" | "VIP";
  employer: { id: string; companyName: string; logoUrl?: string | null };
}

export function VipJobsSection() {
  const [jobs, setJobs] = useState<VipJob[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .get("/jobs?tier=VIP&limit=6")
      .then((r) => setJobs(r.data.jobs ?? []))
      .catch(() => setJobs([]))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;
  if (jobs.length === 0) return null;

  return (
    <section className="py-24 bg-bg-0" id="vip-jobs">
      <div className="max-w-wrap mx-auto px-6">
        <div className="text-center mb-[60px]">
          <ScrollReveal>
            <SectionTag>👑 Việc làm VIP</SectionTag>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="text-[clamp(30px,4vw,46px)] font-black tracking-[-0.03em] leading-[1.15] mb-[14px]">
              Cơ hội cao cấp
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-[16px] text-t1 max-w-[500px] mx-auto leading-[1.75]">
              Tin tuyển dụng VIP từ các công ty hàng đầu — được boost lên trang chủ.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-9">
          {jobs.map((job, i) => {
            const initial = job.employer.companyName?.[0]?.toUpperCase() ?? "?";
            return (
              <ScrollReveal key={job.id} delay={i * 0.08}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="card-dark block p-5 rounded-[18px] hover:border-[rgba(245,158,11,.4)] hover:-translate-y-[2px] transition-all"
                  data-vip-job
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-bg-3 flex items-center justify-center">
                      {job.employer.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={job.employer.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[18px] font-black gradient-text">{initial}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-yellow-400 to-amber-500 text-black mb-1">
                        👑 VIP
                      </span>
                      <h3 className="text-[15px] font-bold text-t0 leading-snug line-clamp-2">{job.title}</h3>
                      <p className="text-[12px] text-t1 mt-0.5 truncate">
                        {job.employer.companyName} · {job.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge-type">{formatJobType(job.jobType)}</span>
                    <span className="badge-mode">{formatWorkMode(job.workMode)}</span>
                    <span className="badge-salary">
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-dark/50">
                    <span className="text-[11px] text-t2">{job.industry}</span>
                    <span className="text-[11px] text-t2">{timeAgo(job.createdAt)}</span>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal className="text-center">
          <Link
            href="/jobs?tier=VIP"
            className="inline-flex items-center text-[15px] font-semibold text-t0 border border-[rgba(245,158,11,.3)] bg-[rgba(245,158,11,.05)] px-7 py-[13px] rounded-[12px] hover:border-[rgba(245,158,11,.5)] hover:bg-[rgba(245,158,11,.1)] transition-all"
          >
            Xem tất cả việc làm VIP →
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
