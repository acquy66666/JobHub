"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SkillCombobox from "@/components/skills/SkillCombobox";

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
  legacySkills?: string[];
  preferredJobTypes?: string[];
  preferredWorkModes?: string[];
  preferredLocations?: string[];
  preferredIndustries?: string[];
  preferredSalaryMin?: number | null;
  preferredSalaryMax?: number | null;
  openToWork?: boolean;
  cvUrl?: string;
  cvFileName?: string;
  avatarUrl?: string;
  publicSlug?: string | null;
  isPublicProfile?: boolean;
  user?: { email?: string };
  experiences?: Array<{ id: string; company: string; position: string; startDate: string; endDate?: string; isCurrent?: boolean; description?: string }>;
  educations?: Array<{ id: string; school: string; degree: string; major?: string; startYear: number; endYear?: number }>;
}

export default function CandidateProfilePage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [prefJobTypes, setPrefJobTypes] = useState<string[]>([]);
  const [prefWorkModes, setPrefWorkModes] = useState<string[]>([]);
  const [prefLocations, setPrefLocations] = useState<string[]>([]);
  const [prefIndustries, setPrefIndustries] = useState<string[]>([]);
  const [prefSalaryMin, setPrefSalaryMin] = useState<string>("");
  const [prefSalaryMax, setPrefSalaryMax] = useState<string>("");
  const [openToWork, setOpenToWork] = useState<boolean>(true);
  const [locInput, setLocInput] = useState<string>("");
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

  useEffect(() => {
    if (!profile) return;
    setPrefJobTypes(profile.preferredJobTypes ?? []);
    setPrefWorkModes(profile.preferredWorkModes ?? []);
    setPrefLocations(profile.preferredLocations ?? []);
    setPrefIndustries(profile.preferredIndustries ?? []);
    setPrefSalaryMin(profile.preferredSalaryMin ? String(profile.preferredSalaryMin) : "");
    setPrefSalaryMax(profile.preferredSalaryMax ? String(profile.preferredSalaryMax) : "");
    setOpenToWork(profile.openToWork ?? true);
  }, [profile?.preferredJobTypes?.join(), profile?.preferredWorkModes?.join(), profile?.preferredLocations?.join(), profile?.preferredIndustries?.join(), profile?.preferredSalaryMin, profile?.preferredSalaryMax, profile?.openToWork]);

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

  if (isLoading) return <div className="p-8 animate-pulse"><div className="h-8 bg-bg-2 rounded w-1/3 mb-4" /><div className="h-64 bg-bg-2 rounded-2xl" /></div>;

  return (
    <div className="p-4 sm:p-8 max-w-4xl space-y-8">
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
            {profile?.legacySkills && profile.legacySkills.length > 0 && (
              <div data-testid="legacy-skills-banner" className="mb-3 p-3 rounded-xl border border-[rgba(245,158,11,.3)] bg-[rgba(245,158,11,.06)]">
                <p className="text-[12px] text-[#FCD34D] font-semibold mb-2">
                  ⚠️ Có {profile.legacySkills.length} kỹ năng cũ chưa khớp với hệ thống mới
                </p>
                <p className="text-[11px] text-t1 mb-2">Hãy chọn lại từ danh sách bên dưới rồi xoá các mục cũ này.</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.legacySkills.map((txt) => (
                    <span key={txt} className="inline-flex items-center gap-1 bg-bg-3 border border-[rgba(245,158,11,.25)] text-[#FCD34D] px-2.5 py-1 rounded-full text-[11px]">
                      {txt}
                      <button
                        type="button"
                        aria-label={`Xoá ${txt}`}
                        onClick={() => {
                          const next = (profile.legacySkills ?? []).filter((s) => s !== txt);
                          api.put("/candidate/profile", { legacySkills: next }).then(() => qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() }));
                        }}
                        className="ml-0.5 text-[#FCD34D]/60 hover:text-red-400"
                      >×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <SkillCombobox value={skills} onChange={setSkills} />
            <p className="mt-1.5 text-[11px] text-[#55556A]">Chọn từ ngân hàng kỹ năng. Tìm theo tên tiếng Việt / Anh / viết tắt.</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={updateMutation.isPending} className="btn-primary px-6 py-2.5 rounded-xl text-[14px] font-semibold disabled:opacity-60">
              {updateMutation.isPending ? "Đang lưu..." : "Lưu thông tin"}
            </button>
            {saved && <span className="text-[13px] text-green-400">✓ Đã lưu</span>}
          </div>
        </form>
      </ScrollReveal>

      {/* Preferences */}
      <ScrollReveal direction="up" delay={0.07}>
        <div data-testid="prefs-section" className="card-dark p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-t0">🎯 Sở thích công việc</h3>
              <p className="text-[12px] text-t1 mt-0.5">Giúp gợi ý việc làm phù hợp hơn và lọc nhanh trên trang tìm việc.</p>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={openToWork} onChange={(e) => setOpenToWork(e.target.checked)} className="sr-only peer" />
              <span className="w-10 h-5 bg-bg-3 border border-border-dark rounded-full relative peer-checked:bg-brand-gradient transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
              <span className="text-[12px] font-medium text-t1">Đang tìm việc</span>
            </label>
          </div>

          {/* JobTypes */}
          <div>
            <label className={labelClass}>Hình thức công việc</label>
            <div className="flex flex-wrap gap-2" data-testid="pref-jobtypes">
              {[
                { v: "FULL_TIME", l: "Toàn thời gian" },
                { v: "PART_TIME", l: "Bán thời gian" },
                { v: "CONTRACT", l: "Hợp đồng" },
                { v: "INTERNSHIP", l: "Thực tập" },
                { v: "FREELANCE", l: "Freelance" },
              ].map(({ v, l }) => {
                const active = prefJobTypes.includes(v);
                return (
                  <button key={v} type="button" onClick={() => setPrefJobTypes((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])} className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all ${active ? "bg-[rgba(124,58,237,.18)] border-[rgba(124,58,237,.5)] text-t0" : "bg-bg-3 border-border-dark text-t1 hover:border-[rgba(124,58,237,.3)]"}`}>{l}</button>
                );
              })}
            </div>
          </div>

          {/* WorkModes */}
          <div>
            <label className={labelClass}>Mô hình làm việc</label>
            <div className="flex flex-wrap gap-2" data-testid="pref-workmodes">
              {[
                { v: "ON_SITE", l: "Tại văn phòng" },
                { v: "REMOTE", l: "Làm từ xa" },
                { v: "HYBRID", l: "Kết hợp" },
              ].map(({ v, l }) => {
                const active = prefWorkModes.includes(v);
                return (
                  <button key={v} type="button" onClick={() => setPrefWorkModes((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])} className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all ${active ? "bg-[rgba(59,130,246,.18)] border-[rgba(59,130,246,.5)] text-t0" : "bg-bg-3 border-border-dark text-t1 hover:border-[rgba(59,130,246,.3)]"}`}>{l}</button>
                );
              })}
            </div>
          </div>

          {/* Industries */}
          <div>
            <label className={labelClass}>Ngành nghề quan tâm</label>
            <div className="flex flex-wrap gap-2" data-testid="pref-industries">
              {["Công nghệ thông tin", "Tài chính - Ngân hàng", "Giáo dục", "Y tế", "Bán lẻ", "Marketing", "Kỹ thuật", "Nhân sự", "Kế toán", "Khác"].map((ind) => {
                const active = prefIndustries.includes(ind);
                return (
                  <button key={ind} type="button" onClick={() => setPrefIndustries((p) => p.includes(ind) ? p.filter((x) => x !== ind) : [...p, ind])} className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all ${active ? "bg-[rgba(34,197,94,.18)] border-[rgba(34,197,94,.5)] text-t0" : "bg-bg-3 border-border-dark text-t1 hover:border-[rgba(34,197,94,.3)]"}`}>{ind}</button>
                );
              })}
            </div>
          </div>

          {/* Locations free chip */}
          <div>
            <label className={labelClass}>Địa điểm mong muốn</label>
            <div className="flex flex-wrap gap-2 mb-2" data-testid="pref-locations">
              {prefLocations.map((loc) => (
                <span key={loc} className="inline-flex items-center gap-1 bg-bg-3 border border-border-dark text-t0 px-3 py-1 rounded-full text-[12px]">
                  {loc}
                  <button type="button" aria-label={`Xoá ${loc}`} onClick={() => setPrefLocations((p) => p.filter((x) => x !== loc))} className="text-t2 hover:text-red-400">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={locInput}
                onChange={(e) => setLocInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = locInput.trim(); if (v && !prefLocations.includes(v)) setPrefLocations((p) => [...p, v]); setLocInput(""); } }}
                placeholder="VD: TP.HCM, Hà Nội, Đà Nẵng — Enter để thêm"
                className={inputClass}
              />
            </div>
          </div>

          {/* Salary range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Lương tối thiểu (VND)</label>
              <input type="number" min={0} value={prefSalaryMin} onChange={(e) => setPrefSalaryMin(e.target.value)} placeholder="VD: 15000000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Lương kỳ vọng (VND)</label>
              <input type="number" min={0} value={prefSalaryMax} onChange={(e) => setPrefSalaryMax(e.target.value)} placeholder="VD: 30000000" className={inputClass} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                const payload = {
                  preferredJobTypes: prefJobTypes,
                  preferredWorkModes: prefWorkModes,
                  preferredLocations: prefLocations,
                  preferredIndustries: prefIndustries,
                  preferredSalaryMin: prefSalaryMin === "" ? null : Number(prefSalaryMin),
                  preferredSalaryMax: prefSalaryMax === "" ? null : Number(prefSalaryMax),
                  openToWork,
                };
                api.put("/candidate/profile", payload).then(() => {
                  qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() });
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                });
              }}
              data-testid="prefs-save"
              className="btn-primary px-6 py-2.5 rounded-xl text-[14px] font-semibold"
            >
              Lưu sở thích
            </button>
            {saved && <span className="text-[13px] text-green-400">✓ Đã lưu</span>}
          </div>
        </div>
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

      {/* Public profile */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="card-dark rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[16px] ${profile?.isPublicProfile ? "bg-[rgba(34,197,94,.1)]" : "bg-bg-3"}`}>
              {profile?.isPublicProfile ? "🌐" : "🔒"}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-t0">Hồ sơ công khai</p>
              <p className="text-[12px] text-t2">
                {profile?.isPublicProfile && profile.publicSlug
                  ? `/u/${profile.publicSlug}`
                  : "Chưa công khai — chỉ bạn mới thấy"}
              </p>
            </div>
          </div>
          <a
            href="/candidate/preview"
            className="shrink-0 px-4 py-2 rounded-xl border border-border-dark text-[12px] text-t1 hover:border-[rgba(124,58,237,.4)] hover:text-[#B09BF8] transition-colors"
          >
            Quản lý →
          </a>
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
      <form onSubmit={handleSubmit(onSubmit)} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-bg-2 border border-border-dark rounded-2xl p-6 space-y-4 shadow-[0_24px_80px_rgba(0,0,0,.6)] max-h-[90vh] overflow-y-auto">
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
      <form onSubmit={handleSubmit(onSubmit)} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-bg-2 border border-border-dark rounded-2xl p-6 space-y-4 shadow-[0_24px_80px_rgba(0,0,0,.6)] max-h-[90vh] overflow-y-auto">
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
