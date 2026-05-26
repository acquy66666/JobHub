"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
  companyName: z.string().min(2, "Tên công ty ít nhất 2 ký tự"),
  description: z.string().optional(),
  website: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  location: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];
const INDUSTRIES = ["Công nghệ thông tin", "Tài chính - Ngân hàng", "Giáo dục", "Y tế", "Bán lẻ", "Marketing", "Kỹ thuật", "Nhân sự", "Kế toán", "Khác"];

const inputClass = "w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2.5 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] transition-all";
const labelClass = "block text-[12px] font-semibold text-t1 uppercase tracking-wide mb-1.5";

interface EmployerProfile {
  companyName?: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  logoUrl?: string;
}

export default function EmployerProfilePage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = useQuery<EmployerProfile>({
    queryKey: queryKeys.employerProfile(),
    queryFn: () => api.get("/employer/profile").then((r) => r.data),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      companyName: profile.companyName ?? "",
      description: profile.description ?? "",
      website: profile.website ?? "",
      industry: profile.industry ?? "",
      companySize: profile.companySize ?? "",
      location: profile.location ?? "",
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData | ProfileForm) => {
      if (data instanceof FormData) return api.put("/employer/profile", data, { headers: { "Content-Type": "multipart/form-data" } });
      return api.put("/employer/profile", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.employerProfile() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append("logo", file);
    updateMutation.mutate(fd);
  }

  if (isLoading) return <div className="p-8 animate-pulse"><div className="h-8 bg-bg-2 rounded w-1/3 mb-4" /><div className="h-64 bg-bg-2 rounded-2xl" /></div>;

  const logoLetter = profile?.companyName?.[0]?.toUpperCase() ?? "C";

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <ScrollReveal direction="up">
        <h1 className="text-[24px] font-extrabold text-t0 mb-1">Hồ sơ công ty</h1>
        <p className="text-[14px] text-t1">Cập nhật thông tin công ty để thu hút ứng viên tiềm năng.</p>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.05}>
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="card-dark p-6 rounded-2xl space-y-5">
          {/* Logo upload */}
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => fileRef.current?.click()} className="relative group">
              {(logoPreview || profile?.logoUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview ?? profile?.logoUrl} alt="" className="w-20 h-20 rounded-2xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center text-[28px] font-black text-white">
                  {logoLetter}
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-medium">Đổi logo</div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
            <div>
              <p className="text-[15px] font-bold text-t0">{profile?.companyName ?? "Tên công ty"}</p>
              <p className="text-[12px] text-t2">Nhấn vào logo để thay đổi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className={labelClass}>Tên công ty *</label><input {...register("companyName")} className={inputClass} />{errors.companyName && <p className="text-[12px] text-red-400 mt-1">{errors.companyName.message}</p>}</div>
            <div>
              <label className={labelClass}>Ngành nghề</label>
              <select {...register("industry")} className={inputClass}>
                <option value="">Chọn ngành</option>
                {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Quy mô</label>
              <select {...register("companySize")} className={inputClass}>
                <option value="">Chọn quy mô</option>
                {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} nhân viên</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Địa điểm</label><input {...register("location")} placeholder="TP.HCM, Hà Nội..." className={inputClass} /></div>
            <div><label className={labelClass}>Website</label><input {...register("website")} placeholder="https://company.com" className={inputClass} />{errors.website && <p className="text-[12px] text-red-400 mt-1">{errors.website.message}</p>}</div>
            <div className="md:col-span-2"><label className={labelClass}>Giới thiệu công ty</label><textarea {...register("description")} rows={5} placeholder="Mô tả về văn hóa, sản phẩm, môi trường làm việc..." className={`${inputClass} resize-none`} /></div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={updateMutation.isPending} className="btn-primary px-6 py-2.5 rounded-xl text-[14px] font-semibold disabled:opacity-60">
              {updateMutation.isPending ? "Đang lưu..." : "Lưu thông tin"}
            </button>
            {saved && <span className="text-[13px] text-green-400">✓ Đã lưu</span>}
          </div>
        </form>
      </ScrollReveal>
    </div>
  );
}
