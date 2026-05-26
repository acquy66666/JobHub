"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";

const jobSchema = z.object({
  title: z.string().min(3, "Tiêu đề ít nhất 3 ký tự"),
  industry: z.string().min(1, "Chọn ngành nghề"),
  location: z.string().min(2, "Nhập địa điểm"),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"]),
  workMode: z.enum(["ON_SITE", "REMOTE", "HYBRID"]),
  description: z.string().min(20, "Mô tả ít nhất 20 ký tự"),
  requirements: z.string().min(10, "Yêu cầu ít nhất 10 ký tự"),
  benefits: z.string().optional(),
  experience: z.string().optional(),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  salaryCurrency: z.string().optional(),
  expiresAt: z.string().min(1, "Chọn ngày hết hạn"),
});
type JobForm = z.infer<typeof jobSchema>;

const JOB_TYPES: Array<{ value: JobForm["jobType"]; label: string }> = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
  { value: "CONTRACT", label: "Hợp đồng" },
  { value: "INTERNSHIP", label: "Thực tập" },
  { value: "FREELANCE", label: "Freelance" },
];
const WORK_MODES: Array<{ value: JobForm["workMode"]; label: string }> = [
  { value: "ON_SITE", label: "Tại văn phòng" },
  { value: "REMOTE", label: "Làm từ xa" },
  { value: "HYBRID", label: "Kết hợp" },
];
const INDUSTRIES = ["Công nghệ thông tin", "Tài chính - Ngân hàng", "Giáo dục", "Y tế", "Bán lẻ", "Marketing", "Kỹ thuật", "Nhân sự", "Kế toán", "Khác"];

const inputClass = "w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2.5 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] transition-all";
const labelClass = "block text-[12px] font-semibold text-t1 uppercase tracking-wide mb-1.5";

interface Props {
  defaultValues?: Partial<JobForm>;
  jobId?: string;
  mode: "create" | "edit";
}

export function JobFormComponent({ defaultValues, jobId, mode }: Props) {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobType: "FULL_TIME",
      workMode: "ON_SITE",
      salaryCurrency: "VND",
      ...defaultValues,
    },
  });

  const watched = watch();

  async function goNext() {
    const fields: Array<keyof JobForm>[] = [
      ["title", "industry", "location", "jobType", "workMode"],
      ["description", "requirements", "expiresAt"],
    ];
    const ok = await trigger(fields[step - 1] as (keyof JobForm)[]);
    if (ok) setStep((s) => s + 1);
  }

  async function onSubmit(data: JobForm) {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...data,
        expiresAt: new Date(data.expiresAt).toISOString(),
        salaryMin: data.salaryMin || undefined,
        salaryMax: data.salaryMax || undefined,
      };
      if (mode === "create") {
        await api.post("/employer/jobs", payload);
      } else {
        await api.put(`/employer/jobs/${jobId}`, payload);
      }
      router.push("/employer/jobs");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Đã xảy ra lỗi. Thử lại.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const minExpiry = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Step indicator */}
      <ScrollReveal direction="up" className="mb-8">
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${
                s < step ? "bg-green-500 text-white" : s === step ? "bg-brand-gradient text-white" : "bg-bg-3 text-t2"
              }`}>
                {s < step ? "✓" : s}
              </div>
              <span className={`text-[13px] font-medium ${s === step ? "text-t0" : "text-t2"}`}>
                {s === 1 ? "Thông tin cơ bản" : s === 2 ? "Chi tiết" : "Xem lại"}
              </span>
              {s < 3 && <div className={`w-12 h-[1px] ${s < step ? "bg-green-500" : "bg-border-dark"}`} />}
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Step 1 */}
      {step === 1 && (
        <ScrollReveal direction="up" className="card-dark p-6 rounded-2xl space-y-5">
          <h2 className="text-[17px] font-bold text-t0">Thông tin cơ bản</h2>
          <div><label className={labelClass}>Tiêu đề công việc *</label><input {...register("title")} placeholder="VD: Senior Frontend Developer" className={inputClass} />{errors.title && <p className="text-[12px] text-red-400 mt-1">{errors.title.message}</p>}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ngành nghề *</label>
              <select {...register("industry")} className={inputClass}>
                <option value="">Chọn ngành</option>
                {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
              {errors.industry && <p className="text-[12px] text-red-400 mt-1">{errors.industry.message}</p>}
            </div>
            <div><label className={labelClass}>Địa điểm *</label><input {...register("location")} placeholder="TP.HCM, Hà Nội..." className={inputClass} />{errors.location && <p className="text-[12px] text-red-400 mt-1">{errors.location.message}</p>}</div>
          </div>
          <div>
            <label className={labelClass}>Hình thức làm việc *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {JOB_TYPES.map((t) => {
                const checked = watched.jobType === t.value;
                return (
                  <label key={t.value} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${checked ? "border-primary bg-[rgba(124,58,237,.1)]" : "border-border-dark hover:border-[rgba(124,58,237,.3)]"}`}>
                    <input type="radio" value={t.value} {...register("jobType")} className="hidden" />
                    <span className={`text-[13px] font-medium ${checked ? "text-t0" : "text-t1"}`}>{t.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className={labelClass}>Chế độ làm việc *</label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {WORK_MODES.map((m) => {
                const checked = watched.workMode === m.value;
                return (
                  <label key={m.value} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${checked ? "border-primary bg-[rgba(124,58,237,.1)]" : "border-border-dark hover:border-[rgba(124,58,237,.3)]"}`}>
                    <input type="radio" value={m.value} {...register("workMode")} className="hidden" />
                    <span className={`text-[13px] font-medium ${checked ? "text-t0" : "text-t1"}`}>{m.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={goNext} className="btn-primary px-6 py-2.5 rounded-xl text-[14px] font-semibold">Tiếp theo →</button>
          </div>
        </ScrollReveal>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <ScrollReveal direction="up" className="card-dark p-6 rounded-2xl space-y-5">
          <h2 className="text-[17px] font-bold text-t0">Chi tiết công việc</h2>
          <div>
            <label className={labelClass}>Mô tả công việc *</label>
            <div className="flex justify-end text-[11px] text-t2 -mb-1">{watched.description?.length ?? 0} ký tự</div>
            <textarea {...register("description")} rows={6} placeholder="Mô tả chi tiết về công việc, trách nhiệm, dự án..." className={`${inputClass} resize-none`} />
            {errors.description && <p className="text-[12px] text-red-400 mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Yêu cầu ứng viên *</label>
            <textarea {...register("requirements")} rows={4} placeholder="Kỹ năng, kinh nghiệm, bằng cấp cần thiết..." className={`${inputClass} resize-none`} />
            {errors.requirements && <p className="text-[12px] text-red-400 mt-1">{errors.requirements.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Quyền lợi</label>
            <textarea {...register("benefits")} rows={3} placeholder="Lương thưởng, bảo hiểm, các phúc lợi khác..." className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>Kinh nghiệm</label><input {...register("experience")} placeholder="VD: 2-3 năm" className={inputClass} /></div>
            <div><label className={labelClass}>Lương tối thiểu (VND)</label><input type="number" {...register("salaryMin", { valueAsNumber: true })} placeholder="15000000" className={inputClass} /></div>
            <div><label className={labelClass}>Lương tối đa (VND)</label><input type="number" {...register("salaryMax", { valueAsNumber: true })} placeholder="25000000" className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Ngày hết hạn *</label><input type="date" {...register("expiresAt")} min={minExpiry} className={inputClass} />{errors.expiresAt && <p className="text-[12px] text-red-400 mt-1">{errors.expiresAt.message}</p>}</div>
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl border border-border-dark text-[14px] text-t1 hover:bg-white/[.04] hover:text-t0 transition-colors">← Quay lại</button>
            <button type="button" onClick={goNext} className="btn-primary px-6 py-2.5 rounded-xl text-[14px] font-semibold">Xem lại →</button>
          </div>
        </ScrollReveal>
      )}

      {/* Step 3 - Review */}
      {step === 3 && (
        <ScrollReveal direction="up" className="space-y-4">
          <div className="card-dark p-6 rounded-2xl space-y-3">
            <h2 className="text-[17px] font-bold text-t0">Xem lại trước khi đăng</h2>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div><span className="text-t2">Tiêu đề:</span> <span className="text-t0 font-medium">{watched.title}</span></div>
              <div><span className="text-t2">Ngành:</span> <span className="text-t0 font-medium">{watched.industry}</span></div>
              <div><span className="text-t2">Địa điểm:</span> <span className="text-t0 font-medium">{watched.location}</span></div>
              <div><span className="text-t2">Hình thức:</span> <span className="text-t0 font-medium">{watched.jobType}</span></div>
              <div><span className="text-t2">Chế độ:</span> <span className="text-t0 font-medium">{watched.workMode}</span></div>
              <div><span className="text-t2">Hết hạn:</span> <span className="text-t0 font-medium">{watched.expiresAt}</span></div>
              {watched.salaryMin && <div><span className="text-t2">Lương từ:</span> <span className="text-t0 font-medium">{watched.salaryMin?.toLocaleString()} VND</span></div>}
              {watched.salaryMax && <div><span className="text-t2">Lương đến:</span> <span className="text-t0 font-medium">{watched.salaryMax?.toLocaleString()} VND</span></div>}
            </div>
          </div>
          <div className="card-dark p-5 rounded-2xl">
            <p className="text-[12px] font-semibold text-t2 uppercase tracking-wide mb-2">Mô tả</p>
            <p className="text-[13px] text-t1 whitespace-pre-wrap line-clamp-4">{watched.description}</p>
          </div>
          {error && <p className="text-[13px] text-red-400">{error}</p>}
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl border border-border-dark text-[14px] text-t1 hover:bg-white/[.04] hover:text-t0 transition-colors">← Sửa lại</button>
            <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5 rounded-xl text-[14px] font-bold disabled:opacity-60">
              {loading ? "Đang đăng..." : mode === "create" ? "Đăng tin tuyển dụng" : "Lưu thay đổi"}
            </button>
          </div>
        </ScrollReveal>
      )}

      <div className="hidden">{today}</div>
    </form>
  );
}
