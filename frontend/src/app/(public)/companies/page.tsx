"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";
import { useState } from "react";
import { Pagination } from "@/components/common/Pagination";
import Link from "next/link";

interface Employer {
  id: string;
  companyName: string;
  logoUrl?: string | null;
  industry?: string | null;
  location?: string | null;
  companySize?: string | null;
  _count: { jobs: number };
}

export default function CompaniesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.companies(page),
    queryFn: () => api.get("/employer/companies", { params: { page, limit: 12 } }).then((r) => r.data),
  });

  const employers: Employer[] = data?.employers ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="max-w-wrap mx-auto px-6 pt-24 pb-16">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-t2 hover:text-t0 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Trang chủ
        </Link>
      </div>

      <ScrollReveal direction="up" className="mb-10 text-center">
        <span className="section-tag mb-4 inline-block">Doanh nghiệp</span>
        <h1 className="text-[clamp(32px,5vw,52px)] font-extrabold text-t0 tracking-tight">
          Khám phá <span className="gradient-text">công ty</span> hàng đầu
        </h1>
        <p className="text-[16px] text-t1 mt-4 max-w-2xl mx-auto">
          Hàng trăm công ty đang tuyển dụng. Tìm nhà tuyển dụng phù hợp với bạn.
        </p>
      </ScrollReveal>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card-dark p-5 rounded-2xl animate-pulse space-y-3">
              <div className="w-14 h-14 rounded-xl bg-bg-3" />
              <div className="h-4 bg-bg-3 rounded w-3/4" />
              <div className="h-3 bg-bg-3 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {employers.map((emp, i) => (
              <ScrollReveal key={emp.id} direction="up" delay={i * 0.04}>
                <Link href={`/companies/${emp.id}`} className="card-dark p-5 rounded-2xl space-y-4 block hover:border-[rgba(124,58,237,.38)] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-bg-3 flex items-center justify-center shrink-0">
                      {emp.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={emp.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span className="text-[22px] font-black gradient-text">{emp.companyName[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-t0 truncate">{emp.companyName}</p>
                      {emp.industry && <p className="text-[12px] text-t2 truncate">{emp.industry}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {emp.location && <p className="text-[12px] text-t1">📍 {emp.location}</p>}
                    {emp.companySize && <p className="text-[12px] text-t1">👥 {emp.companySize} nhân viên</p>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border-dark/50">
                    <span className="text-[12px] text-t2">{emp._count.jobs} việc làm</span>
                    <span className="badge-type text-[11px]">Xem ngay →</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
