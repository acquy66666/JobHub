"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { queryKeys } from "@/lib/queryKeys";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobCard } from "@/components/jobs/JobCard";
import { JobCardSkeleton } from "@/components/jobs/JobCardSkeleton";
import { Pagination } from "@/components/common/Pagination";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";

export function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters = {
    page: parseInt(searchParams.get("page") ?? "1"),
    keyword: searchParams.get("keyword") ?? undefined,
    location: searchParams.get("location") ?? undefined,
    industry: searchParams.get("industry") ?? undefined,
    jobType: searchParams.getAll("jobType").join(",") || undefined,
    workMode: searchParams.get("workMode") ?? undefined,
    salaryMin: searchParams.get("salaryMin") ?? undefined,
    salaryMax: searchParams.get("salaryMax") ?? undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.jobs(filters),
    queryFn: () => api.get("/jobs", { params: filters }).then((r) => r.data),
  });

  const jobs = data?.jobs ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/jobs?${params.toString()}`);
  }

  const initialFilters = {
    keyword: searchParams.get("keyword") ?? "",
    location: searchParams.get("location") ?? "",
    industry: searchParams.get("industry") ?? "",
    jobTypes: searchParams.getAll("jobType"),
    workMode: searchParams.get("workMode") ?? "",
    salaryMin: searchParams.get("salaryMin") ?? "",
    salaryMax: searchParams.get("salaryMax") ?? "",
  };

  return (
    <div className="max-w-wrap mx-auto px-6 py-8 pt-24">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-t2 hover:text-t0 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Trang chủ
        </Link>
      </div>

      {/* Page header */}
      <ScrollReveal direction="up" className="mb-8">
        <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold text-t0 tracking-tight">
          Tìm <span className="gradient-text">việc làm</span>
        </h1>
        {!isLoading && (
          <p className="text-[15px] text-t1 mt-2">
            {total > 0 ? `Tìm thấy ${total} việc làm phù hợp` : "Không tìm thấy kết quả nào"}
          </p>
        )}
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Filter sidebar */}
        <ScrollReveal direction="left">
          <JobFilters initial={initialFilters} />
        </ScrollReveal>

        {/* Job list */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="card-dark p-12 rounded-2xl text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-[18px] font-bold text-t0 mb-2">Không tìm thấy việc làm</h3>
              <p className="text-[14px] text-t1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job: Parameters<typeof JobCard>[0]['job'], i: number) => (
                  <ScrollReveal key={job.id} direction="up" delay={i * 0.05}>
                    <JobCard job={job} />
                  </ScrollReveal>
                ))}
              </div>
              <Pagination page={filters.page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
