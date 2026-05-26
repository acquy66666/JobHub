"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { JobFormComponent } from "@/components/employer/JobForm";
import api from "@/lib/api";

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();

  const { data: job, isLoading } = useQuery({
    queryKey: queryKeys.employerJobs(),
    queryFn: () => api.get(`/employer/jobs/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 animate-pulse"><div className="h-8 bg-bg-2 rounded w-1/3 mb-4" /><div className="h-64 bg-bg-2 rounded-2xl" /></div>;

  return (
    <div className="p-8 max-w-3xl">
      <ScrollReveal direction="up" className="mb-8">
        <h1 className="text-[24px] font-extrabold text-t0 mb-1">Sửa tin tuyển dụng</h1>
        <p className="text-[14px] text-t1">Cập nhật thông tin tin tuyển dụng của bạn.</p>
      </ScrollReveal>
      {job && (
        <JobFormComponent
          mode="edit"
          jobId={id}
          defaultValues={{
            title: job.title,
            industry: job.industry,
            location: job.location,
            jobType: job.jobType,
            workMode: job.workMode,
            description: job.description,
            requirements: job.requirements,
            benefits: job.benefits ?? "",
            experience: job.experience ?? "",
            salaryMin: job.salaryMin ?? undefined,
            salaryMax: job.salaryMax ?? undefined,
            salaryCurrency: job.salaryCurrency ?? "VND",
            expiresAt: job.expiresAt?.split("T")[0] ?? "",
          }}
        />
      )}
    </div>
  );
}
