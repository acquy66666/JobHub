"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import { timeAgo } from "@/lib/formatters";
import api from "@/lib/api";
import Link from "next/link";

interface FollowedCompany {
  id: string;
  companyName: string;
  logoUrl: string | null;
  industry: string | null;
  location: string | null;
  isVerified: boolean;
  followedAt: string;
  _count: { jobs: number };
}

export default function FollowedCompaniesPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.followedCompanies(page),
    queryFn: () => api.get("/candidate/followed-companies", { params: { page, limit: 12 } }).then((r) => r.data),
  });

  const companies: FollowedCompany[] = data?.companies ?? [];
  const totalPages = data?.totalPages ?? 1;

  const unfollowMutation = useMutation({
    mutationFn: (employerId: string) => api.delete(`/candidate/followed-companies/${employerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.followedCompanies() });
    },
  });

  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-6">
      <ScrollReveal direction="up">
        <div>
          <h1 className="text-[24px] font-extrabold text-t0 mb-1">Công ty theo dõi</h1>
          <p className="text-[14px] text-t1">
            Nhận thông báo khi có tin tuyển dụng mới từ các công ty bạn quan tâm.
          </p>
        </div>
      </ScrollReveal>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-bg-2 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <ScrollReveal direction="up" delay={0.05}>
          <div className="bg-bg-2 border border-border-dark rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🏢</div>
            <h3 className="text-[18px] font-bold text-t0 mb-2">Chưa theo dõi công ty nào</h3>
            <p className="text-[14px] text-t1 mb-5">
              Theo dõi các công ty yêu thích để nhận thông báo khi có tin mới.
            </p>
            <Link href="/companies" className="btn-primary px-5 py-2 rounded-xl text-[13px] inline-block">
              Khám phá công ty →
            </Link>
          </div>
        </ScrollReveal>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {companies.map((company, i) => {
              const initial = company.companyName?.[0]?.toUpperCase() ?? "?";
              return (
                <ScrollReveal key={company.id} direction="up" delay={i * 0.05}>
                  <div className="bg-bg-2 border border-border-dark rounded-2xl p-5 hover:border-[rgba(124,58,237,.2)] transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-bg-3 flex items-center justify-center shrink-0 overflow-hidden">
                        {company.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={company.logoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[18px] font-black gradient-text">{initial}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/companies/${company.id}`}
                            className="text-[14px] font-bold text-t0 hover:text-[#9D5CF6] transition-colors truncate"
                          >
                            {company.companyName}
                          </Link>
                          {company.isVerified && (
                            <span className="text-blue-400 text-[11px]">✓</span>
                          )}
                        </div>
                        {company.industry && (
                          <p className="text-[11px] text-t2 mt-0.5">{company.industry}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-t2">
                      {company.location && <span>📍 {company.location}</span>}
                      <span>💼 {company._count.jobs} việc đang tuyển</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-t2">Theo dõi {timeAgo(company.followedAt)}</span>
                      <button
                        onClick={() => unfollowMutation.mutate(company.id)}
                        disabled={unfollowMutation.isPending}
                        className="text-[11px] text-t2 hover:text-red-400 transition-colors"
                      >
                        Bỏ theo dõi
                      </button>
                    </div>
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
