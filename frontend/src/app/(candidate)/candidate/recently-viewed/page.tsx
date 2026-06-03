"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { formatSalary, formatJobType, formatWorkMode, timeAgo } from "@/lib/formatters";
import { getRecentlyViewed, clearRecentlyViewed, RecentlyViewedJob } from "@/lib/recentlyViewed";
import { useToast } from "@/store/toastStore";

export default function RecentlyViewedPage() {
  const [jobs, setJobs] = useState<RecentlyViewedJob[]>([]);
  const [loaded, setLoaded] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setJobs(getRecentlyViewed());
    setLoaded(true);
  }, []);

  function handleClear() {
    clearRecentlyViewed();
    setJobs([]);
    toast.success("Đã xóa lịch sử xem");
  }

  return (
    <div className="space-y-6">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-t0">Đã xem gần đây</h1>
            <p className="text-[13px] text-t2 mt-1">
              {loaded ? `${jobs.length} việc làm đã xem` : "Đang tải..."}
            </p>
          </div>
          {jobs.length > 0 && (
            <button
              onClick={handleClear}
              className="text-[13px] text-t2 hover:text-red-400 transition-colors"
            >
              Xóa lịch sử
            </button>
          )}
        </div>
      </ScrollReveal>

      {loaded && jobs.length === 0 ? (
        <ScrollReveal delay={100}>
          <div className="bg-bg-2 border border-border-dark rounded-2xl py-16 text-center">
            <div className="text-4xl mb-3">👁</div>
            <p className="text-[14px] font-medium text-t1">Chưa xem việc làm nào</p>
            <p className="text-[12px] text-t2 mt-1 mb-5">Các tin bạn đã xem sẽ hiển thị ở đây</p>
            <Link
              href="/jobs"
              className="inline-flex btn-primary px-5 py-2.5 rounded-xl text-[13px] font-semibold"
            >
              Khám phá việc làm
            </Link>
          </div>
        </ScrollReveal>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job, i) => {
            const initial = job.employer.companyName?.[0]?.toUpperCase() ?? "?";
            return (
              <ScrollReveal key={job.id} delay={i * 50}>
                <Link href={`/jobs/${job.id}`} className="block group">
                  <div className="bg-bg-2 border border-border-dark rounded-2xl p-4 hover:border-[rgba(124,58,237,.38)] hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-bg-3 flex items-center justify-center shrink-0">
                        {job.employer.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={job.employer.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span className="text-[16px] font-black gradient-text">{initial}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-t0 line-clamp-2 group-hover:text-[#9D5CF6] transition-colors">
                          {job.title}
                        </p>
                        <p className="text-[11px] text-t2 mt-0.5 truncate">{job.employer.companyName}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="badge-type">{formatJobType(job.jobType)}</span>
                      <span className="badge-mode">{formatWorkMode(job.workMode)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-t2">
                      <span>📍 {job.location}</span>
                      <span className="text-green-400 font-medium">
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border-dark/50 flex items-center justify-between text-[10px] text-t2">
                      <span>Xem {timeAgo(job.viewedAt)}</span>
                      <span>{job.industry}</span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
