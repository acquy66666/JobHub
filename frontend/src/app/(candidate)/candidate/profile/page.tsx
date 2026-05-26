"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(2, "Tên ít nhất 2 ký tự"),
  phone: z.string().optional(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const expSchema = z.object({
  company: z.string().min(1, "Nhập tên công ty"),
  position: z.string().min(1, "Nhập chức vụ"),
  startDate: z.string().min(1, "Chọn ngày bắt đầu"),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
});
type ExpForm = z.infer<typeof expSchema>;

const eduSchema = z.object({
  school: z.string().min(1, "Nhập tên trường"),
  degree: z.string().min(1, "Nhập bằng cấp"),
  major: z.string().optional(),
  startYear: z.number().int(),
  endYear: z.number().int().optional(),
});
type EduForm = z.infer<typeof eduSchema>;

const inputClass = "w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2.5 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] transition-all";
const labelClass = "block text-[12px] font-semibold text-t1 uppercase tracking-wide mb-1.5";

interface CandidateProfile {
  fullName?: string;
  phone?: string;
  headline?: string;
  summary?: string;
  location?: string;
  skills?: string[];
  cvUrl?: string;
  cvFileName?: string;
  avatarUrl?: string;
  user?: { email?: string };
  experiences?: Array<{ id: string; company: string; position: string; startDate: string; endDate?: string; isCurrent?: boolean; description?: string }>;
  educations?: Array<{ id: string; school: string; degree: string; major?: string; startYear: number; endYear?: number }>;
}

export default function CandidateProfilePage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [showExpModal, setShowExpModal] = useState(false);
  const [showEduModal, setShowEduModal] = useState(false);
  const [editExp, setEditExp] = useState<(ExpForm & { id: string }) | null>(null);
  const [editEdu, setEditEdu] = useState<(EduForm & { id: string }) | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = useQuery<CandidateProfile>({
    queryKey: queryKeys.candidateProfile(),
    queryFn: () => api.get("/candidate/profile").then((r) => r.data),
  });

  useEffect(() => {
    if (profile?.skills) setSkills(profile.skills);
  }, [profile?.skills?.join()]);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      fullName: profile.fullName ?? "",
      phone: profile.phone ?? "",
      headline: profile.headline ?? "",
      summary: profile.summary ?? "",
      location: profile.location ?? "",
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData | ProfileForm) => {
      if (data instanceof FormData) return api.put("/candidate/profile", data, { headers: { "Content-Type": "multipart/form-data" } });
      return api.put("/candidate/profile", { ...data, skills });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const deleteExpMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/candidate/experience/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() }),
  });

  const deleteEduMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/candidate/education/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() }),
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append("avatar", file);
    updateMutation.mutate(fd);
  }

  function addSkill(value: string) {
    const trimmed = value.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills((s) => [...s, trimmed]);
  }

  function onSkillKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
      setSkillInput("");
    }
  }

  if (isLoading) return <div className="p-8 animate-pulse"><div className="h-8 bg-bg-2 rounded w-1/3 mb-4" /><div className="h-64 bg-bg-2 rounded-2xl" /></div>;

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <ScrollReveal direction="up">
        <h1 className="text-[24px] font-extrabold text-t0 mb-1">Hồ sơ cá nhân</h1>
        <p className="text-[14px] text-t1">Cập nhật thông tin để tăng cơ hội được tuyển dụng.</p>
      </ScrollReveal>

      {/* Avatar + basic form */}
      <ScrollReveal direction="up" delay={0.05}>
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="card-dark p-6 rounded-2xl space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => fileRef.current?.click()} className="relative group">
              {(avatarPreview || profile?.avatarUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview ?? profile?.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-brand-gradient flex items-center justify-center text-[28px] font-black text-white">
                  {profile?.fullName?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-medium">Đổi ảnh</div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            <div>
              <p className="text-[14px] font-semibold text-t0">{profile?.fullName}</p>
              <p className="text-[12px] text-t2">{profile?.user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Họ và tên *</label><input {...register("fullName")} className={inputClass} />{errors.fullName && <p className="text-[12px] text-red-400 mt-1">{errors.fullName.message}</p>}</div>
            <div><label className={labelClass}>Số điện thoại</label><input {...register("phone")} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Tiêu đề nghề nghiệp</label><input {...register("headline")} placeholder="VD: Frontend Developer với 3 năm kinh nghiệm" className={inputClass} /></div>
            <div><label className={labelClass}>Địa điểm</label><input {...register("location")} placeholder="TP.HCM, Hà Nội..." className={inputClass} /></div>
          </div>

          <div><label className={labelClass}>Giới thiệu bản thân</label><textarea {...register("summary")} rows={4} placeholder="Mô tả ngắn về kinh nghiệm và mục tiêu nghề nghiệp..." className={`${inputClass} resize-none`} /></div>

          {/* Skills */}
          <div>
            <label className={labelClass}>Kỹ năng</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 bg-[rgba(124,58,237,.12)] text-[#B09BF8] border border-[rgba(124,58,237,.2)] px-3 py-1 rounded-full text-[12px] font-medium">
                  {s}
                  <button type="button" onClick={() => setSkills((sk) => sk.filter((x) => x !== s))} className="ml-1 text-[#B09BF8]/60 hover:text-red-400">×</button>
                </span>
              ))}
            </div>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={onSkillKey}
              onBlur={() => { if (skillInput) { addSkill(skillInput); setSkillInput(""); } }}
              placeholder="Nhập kỹ năng rồi nhấn Enter hoặc dấu phẩy..."
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={updateMutation.isPending} className="btn-primary px-6 py-2.5 rounded-xl text-[14px] font-semibold disabled:opacity-60">
              {updateMutation.isPending ? "Đang lưu..." : "Lưu thông tin"}
            </button>
            {saved && <span className="text-[13px] text-green-400">✓ Đã lưu</span>}
          </div>
        </form>
      </ScrollReveal>

      {/* Experiences */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border-dark">
            <h3 className="text-[15px] font-bold text-t0">Kinh nghiệm làm việc</h3>
            <button onClick={() => { setEditExp(null); setShowExpModal(true); }} className="btn-primary px-4 py-1.5 rounded-lg text-[12px]">+ Thêm</button>
          </div>
          {(profile?.experiences ?? []).length === 0 ? (
            <p className="p-5 text-[13px] text-t2">Chưa có kinh nghiệm. Thêm để hồ sơ nổi bật hơn.</p>
          ) : (
            <div className="divide-y divide-border-dark">
              {(profile?.experiences ?? []).map((exp: { id: string; company: string; position: string; startDate: string; endDate?: string; isCurrent?: boolean; description?: string }) => (
                <div key={exp.id} className="p-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-semibold text-t0">{exp.position}</p>
                    <p className="text-[13px] text-t1">{exp.company}</p>
                    <p className="text-[12px] text-t2 mt-0.5">
                      {new Date(exp.startDate).toLocaleDateString("vi-VN", { month: "short", year: "numeric" })} —{" "}
                      {exp.isCurrent ? "Hiện tại" : exp.endDate ? new Date(exp.endDate).toLocaleDateString("vi-VN", { month: "short", year: "numeric" }) : ""}
                    </p>
                    {exp.description && <p className="text-[12px] text-t2 mt-1 max-w-lg">{exp.description}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setEditExp({ ...exp, startDate: exp.startDate.slice(0, 7), endDate: exp.endDate?.slice(0, 7) }); setShowExpModal(true); }} className="text-[12px] text-t2 hover:text-t0 px-2 py-1 rounded border border-border-dark transition-colors">Sửa</button>
                    <button onClick={() => deleteExpMutation.mutate(exp.id)} className="text-[12px] text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-500/20 transition-colors">Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Educations */}
      <ScrollReveal direction="up" delay={0.15}>
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border-dark">
            <h3 className="text-[15px] font-bold text-t0">Học vấn</h3>
            <button onClick={() => { setEditEdu(null); setShowEduModal(true); }} className="btn-primary px-4 py-1.5 rounded-lg text-[12px]">+ Thêm</button>
          </div>
          {(profile?.educations ?? []).length === 0 ? (
            <p className="p-5 text-[13px] text-t2">Chưa có học vấn. Thêm để hồ sơ đầy đủ hơn.</p>
          ) : (
            <div className="divide-y divide-border-dark">
              {(profile?.educations ?? []).map((edu: { id: string; school: string; degree: string; major?: string; startYear: number; endYear?: number }) => (
                <div key={edu.id} className="p-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-semibold text-t0">{edu.school}</p>
                    <p className="text-[13px] text-t1">{edu.degree}{edu.major ? ` — ${edu.major}` : ""}</p>
                    <p className="text-[12px] text-t2 mt-0.5">{edu.startYear} — {edu.endYear ?? "Hiện tại"}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setEditEdu(edu); setShowEduModal(true); }} className="text-[12px] text-t2 hover:text-t0 px-2 py-1 rounded border border-border-dark transition-colors">Sửa</button>
                    <button onClick={() => deleteEduMutation.mutate(edu.id)} className="text-[12px] text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-500/20 transition-colors">Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Modals */}
      {showExpModal && <ExperienceModal initial={editExp} onClose={() => setShowExpModal(false)} onSaved={() => { setShowExpModal(false); qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() }); }} />}
      {showEduModal && <EducationModal initial={editEdu} onClose={() => setShowEduModal(false)} onSaved={() => { setShowEduModal(false); qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() }); }} />}
    </div>
  );
}

function ExperienceModal({ initial, onClose, onSaved }: { initial: (ExpForm & { id: string }) | null; onClose: () => void; onSaved: () => void }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ExpForm>({
    resolver: zodResolver(expSchema),
    defaultValues: initial ?? { isCurrent: false },
  });
  const isCurrent = watch("isCurrent");
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: ExpForm) {
    setLoading(true);
    try {
      const payload = {
        ...data,
        startDate: new Date(data.startDate + "-01").toISOString(),
        endDate: !data.isCurrent && data.endDate ? new Date(data.endDate + "-01").toISOString() : null,
      };
      if (initial?.id) await api.put(`/candidate/experience/${initial.id}`, payload);
      else await api.post("/candidate/experience", payload);
      onSaved();
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-bg-2 border border-border-dark rounded-2xl p-6 space-y-4 shadow-[0_24px_80px_rgba(0,0,0,.6)]">
        <h3 className="text-[17px] font-bold text-t0">{initial ? "Sửa kinh nghiệm" : "Thêm kinh nghiệm"}</h3>
        <div><label className={labelClass}>Tên công ty *</label><input {...register("company")} className={inputClass} />{errors.company && <p className="text-[12px] text-red-400 mt-1">{errors.company.message}</p>}</div>
        <div><label className={labelClass}>Chức vụ *</label><input {...register("position")} className={inputClass} />{errors.position && <p className="text-[12px] text-red-400 mt-1">{errors.position.message}</p>}</div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>Từ tháng *</label><input type="month" {...register("startDate")} className={inputClass} /></div>
          <div><label className={labelClass}>Đến tháng</label><input type="month" {...register("endDate")} className={inputClass} disabled={!!isCurrent} /></div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register("isCurrent")} className="w-4 h-4 accent-[#7C3AED]" />
          <span className="text-[13px] text-t1">Đang làm hiện tại</span>
        </label>
        <div><label className={labelClass}>Mô tả</label><textarea {...register("description")} rows={3} className={`${inputClass} resize-none`} /></div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border-dark text-[13px] text-t1 hover:bg-white/[.04] transition-colors">Hủy</button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-60">{loading ? "Đang lưu..." : "Lưu"}</button>
        </div>
      </form>
    </div>
  );
}

function EducationModal({ initial, onClose, onSaved }: { initial: (EduForm & { id: string }) | null; onClose: () => void; onSaved: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<EduForm>({
    resolver: zodResolver(eduSchema),
    defaultValues: initial ?? {},
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: EduForm) {
    setLoading(true);
    try {
      if (initial?.id) await api.put(`/candidate/education/${initial.id}`, data);
      else await api.post("/candidate/education", data);
      onSaved();
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-bg-2 border border-border-dark rounded-2xl p-6 space-y-4 shadow-[0_24px_80px_rgba(0,0,0,.6)]">
        <h3 className="text-[17px] font-bold text-t0">{initial ? "Sửa học vấn" : "Thêm học vấn"}</h3>
        <div><label className={labelClass}>Tên trường *</label><input {...register("school")} className={inputClass} />{errors.school && <p className="text-[12px] text-red-400 mt-1">{errors.school.message}</p>}</div>
        <div><label className={labelClass}>Bằng cấp *</label><input {...register("degree")} placeholder="VD: Cử nhân, Thạc sĩ..." className={inputClass} /></div>
        <div><label className={labelClass}>Chuyên ngành</label><input {...register("major")} className={inputClass} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>Năm bắt đầu *</label><input type="number" {...register("startYear", { valueAsNumber: true })} min={1950} max={2030} className={inputClass} /></div>
          <div><label className={labelClass}>Năm kết thúc</label><input type="number" {...register("endYear", { valueAsNumber: true })} min={1950} max={2030} className={inputClass} /></div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border-dark text-[13px] text-t1 hover:bg-white/[.04] transition-colors">Hủy</button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-60">{loading ? "Đang lưu..." : "Lưu"}</button>
        </div>
      </form>
    </div>
  );
}
