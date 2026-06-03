"use client";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { JobCard } from "@/components/jobs/JobCard";
import { Pagination } from "@/components/common/Pagination";
import api from "@/lib/api";
import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

interface Company {
  id: string;
  companyName: string;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  companySize: string | null;
  description: string | null;
  location: string | null;
  isVerified: boolean;
  _count: { jobs: number };
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isCandidate = user?.role === "CANDIDATE";

  const { data: company, isLoading: companyLoading } = useQuery<Company>({
    queryKey: queryKeys.company(id),
    queryFn: () => api.get(`/employer/companies/${id}`).then((r) => r.data),
  });

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: queryKeys.companyJobs(id, page),
    queryFn: () => api.get("/jobs", { params: { employerId: id, page, limit: 9 } }).then((r) => r.data),
    enabled: !!id,
  });

  const { data: followStatus } = useQuery({
    queryKey: queryKeys.followStatus(id),
    queryFn: () => api.get(`/candidate/followed-companies/${id}/status`).then((r) => r.data),
    enabled: isCandidate,
  });

  const followMutation = useMutation({
    mutationFn: () => api.post(`/candidate/followed-companies/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.followStatus(id) }),
  });

  const unfollowMutation = useMutation({
    mutationFn: () => api.delete(`/candidate/followed-companies/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.followStatus(id) }),
  });

  const jobs = jobsData?.jobs ?? [];
  const totalPages = jobsData?.totalPages ?? 1;

  if (companyLoading) {
    return (
      <div className="max-w-wrap mx-auto px-6 pt-24 pb-16 animate-pulse space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-bg-3" />
          <div className="space-y-2 flex-1">
            <div className="h-7 bg-bg-3 rounded w-1/3" />
            <div className="h-4 bg-bg-3 rounded w-1/4" />
          </div>
        </div>
        <div className="h-32 bg-bg-3 rounded-2xl" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-wrap mx-auto px-6 pt-32 pb-16 text-center">
        <p className="text-[18px] text-t1">Không tìm thấy công ty.</p>
        <Link href="/companies" className="btn-primary mt-6 inline-block px-6 py-3 rounded-xl text-[14px]">Quay lại</Link>
      </div>
    );
  }

  return (
    <div className="max-w-wrap mx-auto px-6 pt-24 pb-16">
      {/* Company header */}
      <ScrollReveal direction="up" className="mb-8">
        <div className="card-dark rounded-2xl p-8">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="w-20 h-20 rounded-2xl bg-bg-3 flex items-center justify-center shrink-0 overflow-hidden">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[32px] font-black gradient-text">{company.companyName[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-[26px] font-extrabold text-t0 tracking-tight">{company.companyName}</h1>
                {company.isVerified && (
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[rgba(34,197,94,.12)] text-green-400 border border-green-500/20 font-medium">✓ Đã xác thực</span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-[13px] text-t1">
                {company.industry && <span>🏭 {company.industry}</span>}
                {company.location && <span>📍 {company.location}</span>}
                {company.companySize && <span>👥 {company.companySize} nhân viên</span>}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    🔗 {company.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
              <div className="flex gap-3 mt-4 flex-wrap">
                <span className="text-[13px] px-3 py-1.5 rounded-xl bg-bg-3 text-t1 border border-border-dark">
                  {company._count.jobs} việc làm đang tuyển
                </span>
                {isCandidate && (
                  followStatus?.isFollowing ? (
                    <button
                      onClick={() => unfollowMutation.mutate()}
                      disabled={unfollowMutation.isPending}
                      className="text-[13px] px-3 py-1.5 rounded-xl bg-[rgba(124,58,237,.12)] text-[#B09BF8] border border-[rgba(124,58,237,.2)] hover:bg-[rgba(124,58,237,.2)] transition-colors"
                    >
                      {unfollowMutation.isPending ? "..." : "🏢 Đang theo dõi"}
                    </button>
                  ) : (
                    <button
                      onClick={() => followMutation.mutate()}
                      disabled={followMutation.isPending}
                      className="text-[13px] px-3 py-1.5 rounded-xl border border-border-dark text-t1 hover:text-t0 hover:bg-white/[.04] transition-colors"
                    >
                      {followMutation.isPending ? "..." : "🏢 Theo dõi"}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* About */}
      {company.description && (
        <ScrollReveal direction="up" delay={0.08} className="mb-8">
          <div className="card-dark rounded-2xl p-6">
            <h2 className="text-[16px] font-bold text-t0 mb-3">Giới thiệu công ty</h2>
            <p className="text-[14px] text-t1 leading-relaxed whitespace-pre-line">{company.description}</p>
          </div>
        </ScrollReveal>
      )}

      {/* Jobs */}
      <ScrollReveal direction="up" delay={0.12}>
        <h2 className="text-[20px] font-extrabold text-t0 mb-5">
          Việc làm đang tuyển
          {jobs.length > 0 && <span className="text-[14px] text-t2 font-normal ml-2">({jobsData?.total ?? 0} vị trí)</span>}
        </h2>
        {jobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-dark p-5 rounded-2xl animate-pulse space-y-3 h-44">
                <div className="h-4 bg-bg-3 rounded w-2/3" />
                <div className="h-3 bg-bg-3 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="card-dark rounded-2xl p-10 text-center">
            <p className="text-[14px] text-t2">Công ty hiện chưa có tin tuyển dụng nào.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job: Parameters<typeof JobCard>[0]["job"], i: number) => (
                <JobCard key={job.id} job={job} delay={i * 0.06} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </ScrollReveal>
    </div>
  );
}
