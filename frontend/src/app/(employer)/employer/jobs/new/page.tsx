import { ScrollReveal } from "@/components/common/ScrollReveal";
import { JobFormComponent } from "@/components/employer/JobForm";

export default function NewJobPage() {
  return (
    <div className="p-8 max-w-3xl">
      <ScrollReveal direction="up" className="mb-8">
        <h1 className="text-[24px] font-extrabold text-t0 mb-1">Đăng tin tuyển dụng</h1>
        <p className="text-[14px] text-t1">Tin đăng sẽ được duyệt trước khi hiển thị công khai.</p>
      </ScrollReveal>
      <JobFormComponent mode="create" />
    </div>
  );
}
