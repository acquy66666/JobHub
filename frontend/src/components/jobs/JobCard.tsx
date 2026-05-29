"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { formatSalary, formatJobType, formatWorkMode, timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/store/toastStore";

interface Job {
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
  employer: {
    id: string;
    companyName: string;
    logoUrl?: string | null;
    location?: string | null;
    industry?: string | null;
  };
}

interface Props {
  job: Job;
  delay?: number;
  isSaved?: boolean;
  onUnsave?: (jobId: string) => void;
}

export function JobCard({ job, delay = 0, isSaved = false, onUnsave }: Props) {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(isSaved);
  const [loading, setLoading] = useState(false);
  const initial = job.employer.companyName?.[0]?.toUpperCase() ?? "?";
  const toast = useToast();

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== "CANDIDATE") return;
    setLoading(true);
    try {
      if (saved) {
        await api.delete(`/candidate/saved-jobs/${job.id}`);
        setSaved(false);
        onUnsave?.(job.id);
        toast.info("Đã bỏ lưu việc làm");
      } else {
        await api.post("/candidate/saved-jobs", { jobId: job.id });
        setSaved(true);
        toast.success("Đã lưu việc làm");
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
    setLoading(false);
  }

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="card-dark block p-5 rounded-[18px] hover:border-[rgba(124,58,237,.38)] hover:-translate-y-[2px] hover:shadow-[0_14px_48px_rgba(0,0,0,.3)] transition-all duration-200 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Company logo */}
        <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-bg-3 flex items-center justify-center">
          {job.employer.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.employer.logoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[18px] font-black gradient-text">{initial}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-bold text-t0 leading-snug group-hover:text-white transition-colors line-clamp-2">
              {job.title}
            </h3>
            {user?.role === "CANDIDATE" && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="shrink-0 p-1.5 rounded-lg text-t2 hover:text-primary hover:bg-[rgba(124,58,237,.1)] transition-colors"
                title={saved ? "Bỏ lưu" : "Lưu việc làm"}
              >
                <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            )}
          </div>

          {/* Company & location */}
          <p className="text-[13px] text-t1 mt-1 truncate">{job.employer.companyName} · {job.location}</p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="badge-type">{formatJobType(job.jobType)}</span>
            <span className="badge-mode">{formatWorkMode(job.workMode)}</span>
            <span className="badge-salary">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-dark/50">
        <span className="text-[11px] text-t2">{job.industry}</span>
        <span className="text-[11px] text-t2">{timeAgo(job.createdAt)}</span>
      </div>
    </Link>
  );
}
