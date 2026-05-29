"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { useToast } from "@/store/toastStore";
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

interface JobTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  requirements: string;
  benefits?: string;
  industry: string;
  jobType: JobForm["jobType"];
  workMode: JobForm["workMode"];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experience?: string;
  location?: string;
}

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
  const [showTemplates, setShowTemplates] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, watch, trigger, reset, formState: { errors } } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobType: "FULL_TIME",
      workMode: "ON_SITE",
      salaryCurrency: "VND",
      ...defaultValues,
    },
  });

  const { data: templates = [] } = useQuery<JobTemplate[]>({
    queryKey: queryKeys.employerTemplates(),
    queryFn: () => api.get("/employer/templates").then((r) => r.data),
    enabled: mode === "create",
  });

  const saveTemplateMutation = useMutation({
    mutationFn: (name: string) => {
      const values = watch();
      return api.post("/employer/templates", {
        name,
        title: values.title,
        description: values.description,
        requirements: values.requirements,
        benefits: values.benefits,
        industry: values.industry,
        jobType: values.jobType,
        workMode: values.workMode,
        salaryMin: values.salaryMin,
        salaryMax: values.salaryMax,
        salaryCurrency: values.salaryCurrency,
        experience: values.experience,
        location: values.location,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.employerTemplates() });
      toast.success("Đã lưu template");
      setSaveTemplateName("");
      setShowSaveTemplate(false);
    },
    onError: () => toast.error("Lưu template thất bại"),
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/employer/templates/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.employerTemplates() });
      toast.info("Đã xóa template");
    },
    onError: () => toast.error("Xóa template thất bại"),
  });

  function applyTemplate(tpl: JobTemplate) {
    reset({
      title: tpl.title,
      description: tpl.description,
      requirements: tpl.requirements,
      benefits: tpl.benefits ?? "",
      industry: tpl.industry,
      jobType: tpl.jobType,
      workMode: tpl.workMode,
      salaryMin: tpl.salaryMin,
      salaryMax: tpl.salaryMax,
      salaryCurrency: tpl.salaryCurrency ?? "VND",
      experience: tpl.experience ?? "",
      location: tpl.location ?? "",
      expiresAt: "",
    });
    setShowTemplates(false);
    toast.success(`Đã áp dụng mẫu "${tpl.name}"`);
  }

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
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-t0">Thông tin cơ bản</h2>
            {mode === "create" && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTemplates((v) => !v)}
                  className="px-3 py-1.5 rounded-lg border border-[rgba(124,58,237,.3)] text-[12px] text-[#B09BF8] hover:bg-[rgba(124,58,237,.1)] transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Dùng mẫu {templates.length > 0 && `(${templates.length})`}
                </button>
                {showTemplates && (
                  <div className="absolute right-0 top-full mt-1 w-72 bg-bg-2 border border-border-dark rounded-xl shadow-[0_12px_40px_rgba(0,0,0,.5)] z-20 overflow-hidden">
                    {templates.length === 0 ? (
                      <p className="p-4 text-[12px] text-t2 text-center">Chưa có mẫu nào.</p>
                    ) : (
                      <div className="divide-y divide-border-dark max-h-64 overflow-y-auto">
                        {templates.map((tpl) => (
                          <div key={tpl.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[.03] transition-colors">
                            <button type="button" onClick={() => applyTemplate(tpl)} className="text-[13px] text-t0 font-medium text-left flex-1 truncate hover:text-white">
                              {tpl.name}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTemplateMutation.mutate(tpl.id)}
                              className="ml-2 shrink-0 text-t2 hover:text-red-400 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
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

          {/* Save as template */}
          {mode === "create" && (
            <div className="border-t border-border-dark pt-4">
              {showSaveTemplate ? (
                <div className="flex gap-2">
                  <input
                    value={saveTemplateName}
                    onChange={(e) => setSaveTemplateName(e.target.value)}
                    placeholder="Tên mẫu (VD: Senior Dev Template)"
                    className={`flex-1 bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] transition-all`}
                  />
                  <button
                    type="button"
                    disabled={!saveTemplateName.trim() || saveTemplateMutation.isPending}
                    onClick={() => saveTemplateMutation.mutate(saveTemplateName.trim())}
                    className="px-4 py-2 rounded-xl bg-[rgba(124,58,237,.15)] border border-[rgba(124,58,237,.3)] text-[12px] text-[#B09BF8] hover:bg-[rgba(124,58,237,.25)] transition-colors disabled:opacity-50"
                  >
                    Lưu
                  </button>
                  <button type="button" onClick={() => setShowSaveTemplate(false)} className="px-3 py-2 rounded-xl border border-border-dark text-[12px] text-t2 hover:text-t0 transition-colors">Hủy</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSaveTemplate(true)}
                  className="text-[12px] text-t2 hover:text-[#B09BF8] transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  Lưu làm mẫu để dùng lại sau
                </button>
              )}
            </div>
          )}

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
