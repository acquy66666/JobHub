"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { ApplyModal } from "@/components/jobs/ApplyModal";
import { formatSalary, formatJobType, formatWorkMode, timeAgo } from "@/lib/formatters";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [applyOpen, setApplyOpen] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: queryKeys.job(id),
    queryFn: () => api.get(`/jobs/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: profile } = useQuery({
    queryKey: queryKeys.candidateProfile(),
    queryFn: () => api.get("/candidate/profile").then((r) => r.data),
    enabled: user?.role === "CANDIDATE",
  });

  if (isLoading) {
    return (
      <div className="max-w-wrap mx-auto px-6 pt-24 pb-12 animate-pulse space-y-6">
        <div className="h-8 bg-bg-2 rounded w-2/3" />
        <div className="h-4 bg-bg-2 rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mt-8">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-bg-2 rounded-2xl" />)}
          </div>
          <div className="h-48 bg-bg-2 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-wrap mx-auto px-6 pt-24 pb-12 text-center">
        <h2 className="text-[24px] font-bold text-t0 mb-4">Không tìm thấy tin tuyển dụng</h2>
        <Link href="/jobs" className="btn-primary px-6 py-2.5 rounded-xl text-[14px]">← Quay lại danh sách</Link>
      </div>
    );
  }

  const initial = job.employer.companyName?.[0]?.toUpperCase() ?? "?";

  return (
    <>
      <div className="max-w-wrap mx-auto px-6 pt-24 pb-16">
        {/* Back link */}
        <ScrollReveal direction="up">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-[13px] text-t2 hover:text-t0 transition-colors mb-6">
            ← Danh sách việc làm
          </Link>
        </ScrollReveal>

        {/* Job header */}
        <ScrollReveal direction="up" delay={0.05}>
          <div className="flex items-start gap-5 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-bg-3 flex items-center justify-center shrink-0">
              {job.employer.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={job.employer.logoUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span className="text-[24px] font-black gradient-text">{initial}</span>
              )}
            </div>
            <div>
              <h1 className="text-[clamp(22px,3vw,32px)] font-extrabold text-t0 tracking-tight">{job.title}</h1>
              <p className="text-[15px] text-t1 mt-1">{job.employer.companyName} · {job.location}</p>
              <p className="text-[12px] text-t2 mt-1">Đăng {timeAgo(job.createdAt)}</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Key info bar */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="flex flex-wrap gap-3 mb-8 p-4 bg-bg-2 border border-border-dark rounded-2xl">
            <span className="badge-type">{formatJobType(job.jobType)}</span>
            <span className="badge-mode">{formatWorkMode(job.workMode)}</span>
            <span className="badge-salary">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
            {job.experience && (
              <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-lg border bg-bg-3 text-t1 border-border-dark">
                Kinh nghiệm: {job.experience}
              </span>
            )}
            <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-lg border bg-bg-3 text-t1 border-border-dark">
              Hết hạn: {new Date(job.expiresAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Main content */}
          <div className="space-y-6">
            <ScrollReveal direction="up" delay={0.15}>
              <div className="card-dark p-6 rounded-2xl space-y-3">
                <h2 className="text-[17px] font-bold text-t0">Mô tả công việc</h2>
                <p className="text-[14px] text-t1 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <div className="card-dark p-6 rounded-2xl space-y-3">
                <h2 className="text-[17px] font-bold text-t0">Yêu cầu ứng viên</h2>
                <p className="text-[14px] text-t1 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
              </div>
            </ScrollReveal>

            {job.benefits && (
              <ScrollReveal direction="up" delay={0.25}>
                <div className="card-dark p-6 rounded-2xl space-y-3">
                  <h2 className="text-[17px] font-bold text-t0">Quyền lợi</h2>
                  <p className="text-[14px] text-t1 leading-relaxed whitespace-pre-wrap">{job.benefits}</p>
                </div>
              </ScrollReveal>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-20">
            <ScrollReveal direction="right" delay={0.1}>
              <div className="card-dark p-6 rounded-2xl space-y-4">
                {user?.role === "CANDIDATE" ? (
                  <button
                    onClick={() => setApplyOpen(true)}
                    className="btn-primary w-full py-3 rounded-xl text-[15px] font-bold"
                  >
                    Ứng tuyển ngay
                  </button>
                ) : !user ? (
                  <Link
                    href={`/login?redirect=/jobs/${id}`}
                    className="btn-primary w-full py-3 rounded-xl text-[15px] font-bold text-center block"
                  >
                    Đăng nhập để ứng tuyển
                  </Link>
                ) : null}

                <div className="border-t border-border-dark pt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-bg-3 flex items-center justify-center shrink-0">
                      {job.employer.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={job.employer.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span className="text-[18px] font-black gradient-text">{initial}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-t0">{job.employer.companyName}</p>
                      <p className="text-[12px] text-t2">{job.employer.industry}</p>
                    </div>
                  </div>
                  {job.employer.location && <p className="text-[13px] text-t1">📍 {job.employer.location}</p>}
                  {job.employer.companySize && <p className="text-[13px] text-t1">👥 {job.employer.companySize} nhân viên</p>}
                  {job.employer.website && (
                    <a href={job.employer.website} target="_blank" rel="noreferrer" className="text-[13px] text-primary hover:underline">
                      🌐 Website công ty
                    </a>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      <ApplyModal
        jobId={id}
        jobTitle={job.title}
        savedCvUrl={profile?.cvUrl}
        savedCvFileName={profile?.cvFileName}
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
      />
    </>
  );
}
