"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getTemplateById } from "@/components/cv-templates";
import { EMPTY_CV_DATA, CVData, CVExperience, CVEducation } from "@/lib/cvTypes";
import { exportCVToPdf, cvToBlob } from "@/lib/exportPdf";
import { useToast } from "@/store/toastStore";
import api from "@/lib/api";
import Link from "next/link";

// Tabs
type Tab = "personal" | "experience" | "education" | "skills" | "extra";
const TABS: { id: Tab; label: string }[] = [
  { id: "personal", label: "Cá nhân" },
  { id: "experience", label: "Kinh nghiệm" },
  { id: "education", label: "Học vấn" },
  { id: "skills", label: "Kỹ năng" },
  { id: "extra", label: "Thêm" },
];

// Map profile → CVData
interface ProfileData {
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  headline?: string;
  summary?: string;
  location?: string;
  skills: string[];
  experiences: Array<{ company: string; position: string; startDate: string; endDate?: string; isCurrent: boolean; description?: string }>;
  educations: Array<{ school: string; degree: string; major?: string; startYear: number; endYear?: number }>;
  user: { email: string };
}

function profileToCV(profile: ProfileData): CVData {
  return {
    ...EMPTY_CV_DATA,
    fullName: profile.fullName ?? "",
    title: profile.headline ?? "",
    email: profile.user?.email ?? "",
    phone: profile.phone ?? "",
    location: profile.location ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    summary: profile.summary ?? "",
    experiences: (profile.experiences ?? []).map((e) => ({
      company: e.company,
      position: e.position,
      startDate: e.startDate?.slice(0, 7) ?? "",
      endDate: e.endDate?.slice(0, 7) ?? "",
      isCurrent: e.isCurrent,
      description: e.description ?? "",
    })),
    educations: (profile.educations ?? []).map((e) => ({
      school: e.school,
      degree: e.degree,
      major: e.major ?? "",
      startYear: e.startYear,
      endYear: e.endYear ?? 0,
    })),
    skills: profile.skills ?? [],
  };
}

// ─── Input helpers ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-t1">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-primary transition-colors";
const textA = `${inp} resize-none`;

export default function CVEditorPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const toast = useToast();
  const qc = useQueryClient();
  const previewRef = useRef<HTMLDivElement>(null);

  const template = getTemplateById(templateId);

  const [tab, setTab] = useState<Tab>("personal");
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [newLang, setNewLang] = useState({ name: "", level: "" });
  const [newCert, setNewCert] = useState({ name: "", issuer: "", year: "" });
  const [newProject, setNewProject] = useState({ name: "", description: "", techStack: "", link: "" });

  // Load profile to pre-fill
  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: queryKeys.candidateProfile(),
    queryFn: () => api.get("/candidate/profile").then((r) => r.data),
  });

  useEffect(() => {
    if (profile && !cvData) setCvData(profileToCV(profile));
  }, [profile, cvData]);

  const set = useCallback(<K extends keyof CVData>(key: K, val: CVData[K]) => {
    setCvData((prev) => prev ? { ...prev, [key]: val } : prev);
  }, []);

  const saveMutation = useMutation({
    mutationFn: async (blob: Blob) => {
      const fd = new FormData();
      fd.append("cv", blob, `CV_${template?.name ?? "template"}.pdf`);
      return api.post("/candidate/cvs", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.candidateCvs() });
      toast.success("Đã lưu CV vào danh sách!");
    },
    onError: () => toast.error("Lưu CV thất bại"),
  });

  if (!template) {
    return (
      <div className="p-8 text-center">
        <p className="text-t1 mb-4">Không tìm thấy mẫu CV này.</p>
        <Link href="/candidate/cv/builder" className="btn-primary px-5 py-2 rounded-xl text-[14px]">← Chọn mẫu khác</Link>
      </div>
    );
  }

  if (isLoading || !cvData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-t1 text-[14px]">Đang tải hồ sơ...</div>
      </div>
    );
  }

  const TemplateComp = template.component;

  async function handleExport() {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      await exportCVToPdf(previewRef.current, `CV_${cvData!.fullName || "jobhub"}.pdf`);
      toast.success("Tải xuống thành công!");
    } catch {
      toast.error("Xuất PDF thất bại. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleSaveToMyCVs() {
    if (!previewRef.current) return;
    setIsSaving(true);
    try {
      const blob = await cvToBlob(previewRef.current);
      await saveMutation.mutateAsync(blob);
    } catch {
      // error handled in mutation
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Experience helpers ───────────────────────────────────────────────────
  function addExp() {
    set("experiences", [...cvData!.experiences, { company: "", position: "", startDate: "", endDate: "", isCurrent: false, description: "" }]);
  }
  function updateExp(i: number, patch: Partial<CVExperience>) {
    const arr = cvData!.experiences.map((e, idx) => idx === i ? { ...e, ...patch } : e);
    set("experiences", arr);
  }
  function removeExp(i: number) { set("experiences", cvData!.experiences.filter((_, idx) => idx !== i)); }

  function addEdu() {
    set("educations", [...cvData!.educations, { school: "", degree: "", major: "", startYear: 2020, endYear: 0 }]);
  }
  function updateEdu(i: number, patch: Partial<CVEducation>) {
    const arr = cvData!.educations.map((e, idx) => idx === i ? { ...e, ...patch } : e);
    set("educations", arr);
  }
  function removeEdu(i: number) { set("educations", cvData!.educations.filter((_, idx) => idx !== i)); }

  function addSkill() {
    const sk = skillInput.trim();
    if (sk && !cvData!.skills.includes(sk)) { set("skills", [...cvData!.skills, sk]); setSkillInput(""); }
  }
  function removeSkill(sk: string) { set("skills", cvData!.skills.filter((s) => s !== sk)); }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* ── Left: Editor ── */}
      <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-border-dark bg-bg-1">
        {/* Header */}
        <div className="p-4 border-b border-border-dark">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/candidate/cv/builder" className="text-[12px] text-t1 hover:text-t0">← Đổi mẫu</Link>
            <span className="text-t2">·</span>
            <span className="text-[12px] font-semibold text-t0">{template.name}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 btn-primary py-2 rounded-xl text-[13px] font-semibold disabled:opacity-60"
            >
              {isExporting ? "Đang xuất..." : "⬇ Tải PDF"}
            </button>
            <button
              onClick={handleSaveToMyCVs}
              disabled={isSaving}
              className="flex-1 py-2 rounded-xl text-[13px] font-semibold border border-border-dark text-t1 hover:text-t0 hover:border-[rgba(124,58,237,.4)] disabled:opacity-60 transition-colors"
            >
              {isSaving ? "Đang lưu..." : "💾 Lưu CV"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-dark px-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2.5 text-[12px] font-semibold transition-colors border-b-2 ${tab === t.id ? "border-primary text-t0" : "border-transparent text-t1 hover:text-t0"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* ── PERSONAL ── */}
          {tab === "personal" && (
            <>
              <Field label="Họ và tên *"><input className={inp} value={cvData.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Nguyễn Văn An" /></Field>
              <Field label="Chức danh / Vị trí"><input className={inp} value={cvData.title} onChange={(e) => set("title", e.target.value)} placeholder="Frontend Developer" /></Field>
              <Field label="Email"><input className={inp} value={cvData.email} onChange={(e) => set("email", e.target.value)} placeholder="email@domain.com" /></Field>
              <Field label="Số điện thoại"><input className={inp} value={cvData.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0901 234 567" /></Field>
              <Field label="Địa điểm"><input className={inp} value={cvData.location} onChange={(e) => set("location", e.target.value)} placeholder="TP. Hồ Chí Minh" /></Field>
              <Field label="Website / Portfolio"><input className={inp} value={cvData.website} onChange={(e) => set("website", e.target.value)} placeholder="yoursite.dev" /></Field>
              <Field label="LinkedIn"><input className={inp} value={cvData.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/username" /></Field>
              <Field label="GitHub"><input className={inp} value={cvData.github} onChange={(e) => set("github", e.target.value)} placeholder="github.com/username" /></Field>
              <Field label="Link ảnh đại diện"><input className={inp} value={cvData.avatarUrl} onChange={(e) => set("avatarUrl", e.target.value)} placeholder="https://..." /></Field>
              <Field label="Giới thiệu bản thân"><textarea className={textA} rows={5} value={cvData.summary} onChange={(e) => set("summary", e.target.value)} placeholder="Mô tả ngắn về bản thân, điểm mạnh và mục tiêu nghề nghiệp..." /></Field>
            </>
          )}

          {/* ── EXPERIENCE ── */}
          {tab === "experience" && (
            <>
              {cvData.experiences.map((exp, i) => (
                <div key={i} className="card-dark p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-bold text-t0">Kinh nghiệm #{i + 1}</span>
                    <button onClick={() => removeExp(i)} className="text-[11px] text-red-400 hover:text-red-300">Xóa</button>
                  </div>
                  <Field label="Công ty"><input className={inp} value={exp.company} onChange={(e) => updateExp(i, { company: e.target.value })} placeholder="TechCorp Vietnam" /></Field>
                  <Field label="Vị trí"><input className={inp} value={exp.position} onChange={(e) => updateExp(i, { position: e.target.value })} placeholder="Senior Developer" /></Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Bắt đầu (MM/YYYY)"><input className={inp} value={exp.startDate} onChange={(e) => updateExp(i, { startDate: e.target.value })} placeholder="2022-03" /></Field>
                    <Field label="Kết thúc"><input className={inp} value={exp.endDate} onChange={(e) => updateExp(i, { endDate: e.target.value })} placeholder="2024-01" disabled={exp.isCurrent} /></Field>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={exp.isCurrent} onChange={(e) => updateExp(i, { isCurrent: e.target.checked, endDate: "" })} className="w-4 h-4 accent-primary" />
                    <span className="text-[12px] text-t1">Đang làm việc tại đây</span>
                  </label>
                  <Field label="Mô tả công việc"><textarea className={textA} rows={3} value={exp.description} onChange={(e) => updateExp(i, { description: e.target.value })} placeholder="Mô tả trách nhiệm và thành tích..." /></Field>
                </div>
              ))}
              <button onClick={addExp} className="w-full py-2.5 border-2 border-dashed border-border-dark rounded-xl text-[13px] text-t1 hover:border-primary hover:text-t0 transition-colors">
                + Thêm kinh nghiệm
              </button>
            </>
          )}

          {/* ── EDUCATION ── */}
          {tab === "education" && (
            <>
              {cvData.educations.map((edu, i) => (
                <div key={i} className="card-dark p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-bold text-t0">Học vấn #{i + 1}</span>
                    <button onClick={() => removeEdu(i)} className="text-[11px] text-red-400 hover:text-red-300">Xóa</button>
                  </div>
                  <Field label="Trường học"><input className={inp} value={edu.school} onChange={(e) => updateEdu(i, { school: e.target.value })} placeholder="ĐH Bách Khoa TP.HCM" /></Field>
                  <Field label="Bằng cấp"><input className={inp} value={edu.degree} onChange={(e) => updateEdu(i, { degree: e.target.value })} placeholder="Kỹ sư / Cử nhân" /></Field>
                  <Field label="Chuyên ngành"><input className={inp} value={edu.major} onChange={(e) => updateEdu(i, { major: e.target.value })} placeholder="Khoa học Máy tính" /></Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Năm bắt đầu"><input className={inp} type="number" value={edu.startYear || ""} onChange={(e) => updateEdu(i, { startYear: +e.target.value })} placeholder="2019" /></Field>
                    <Field label="Năm kết thúc"><input className={inp} type="number" value={edu.endYear || ""} onChange={(e) => updateEdu(i, { endYear: +e.target.value })} placeholder="2023" /></Field>
                  </div>
                </div>
              ))}
              <button onClick={addEdu} className="w-full py-2.5 border-2 border-dashed border-border-dark rounded-xl text-[13px] text-t1 hover:border-primary hover:text-t0 transition-colors">
                + Thêm học vấn
              </button>
            </>
          )}

          {/* ── SKILLS ── */}
          {tab === "skills" && (
            <>
              <Field label="Thêm kỹ năng">
                <div className="flex gap-2">
                  <input className={inp} value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} placeholder="React, TypeScript, ..." />
                  <button onClick={addSkill} className="px-3 py-2 rounded-xl bg-[rgba(124,58,237,.12)] text-[#B09BF8] border border-[rgba(124,58,237,.2)] text-[12px] font-semibold hover:bg-[rgba(124,58,237,.2)] transition-colors whitespace-nowrap">
                    Thêm
                  </button>
                </div>
              </Field>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((sk) => (
                  <span key={sk} className="flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-full bg-[rgba(124,58,237,.1)] text-[#B09BF8] border border-[rgba(124,58,237,.2)]">
                    {sk}
                    <button onClick={() => removeSkill(sk)} className="text-[10px] hover:text-red-400">×</button>
                  </span>
                ))}
              </div>

              <div className="border-t border-border-dark pt-4 space-y-3">
                <p className="text-[12px] font-semibold text-t1">Ngoại ngữ</p>
                {cvData.languages.map((l, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="flex-1 text-[12px] text-t0">{l.name}: {l.level}</span>
                    <button onClick={() => set("languages", cvData.languages.filter((_, idx) => idx !== i))} className="text-[11px] text-red-400">×</button>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2">
                  <input className={inp} value={newLang.name} onChange={(e) => setNewLang((p) => ({ ...p, name: e.target.value }))} placeholder="Tiếng Anh" />
                  <input className={inp} value={newLang.level} onChange={(e) => setNewLang((p) => ({ ...p, level: e.target.value }))} placeholder="B2 / IELTS 6.5" />
                </div>
                <button onClick={() => { if (newLang.name) { set("languages", [...cvData.languages, newLang]); setNewLang({ name: "", level: "" }); } }} className="text-[12px] text-[#B09BF8] hover:text-t0">+ Thêm ngoại ngữ</button>
              </div>
            </>
          )}

          {/* ── EXTRA ── */}
          {tab === "extra" && (
            <>
              {/* Certifications */}
              <div className="space-y-3">
                <p className="text-[12px] font-semibold text-t1">Chứng chỉ</p>
                {cvData.certifications.map((c, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="flex-1 text-[12px] text-t0">{c.name} — {c.issuer} ({c.year})</span>
                    <button onClick={() => set("certifications", cvData.certifications.filter((_, idx) => idx !== i))} className="text-[11px] text-red-400">×</button>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2">
                  <input className={inp} value={newCert.name} onChange={(e) => setNewCert((p) => ({ ...p, name: e.target.value }))} placeholder="AWS Certified" />
                  <input className={inp} value={newCert.issuer} onChange={(e) => setNewCert((p) => ({ ...p, issuer: e.target.value }))} placeholder="Amazon" />
                </div>
                <input className={inp} type="number" value={newCert.year} onChange={(e) => setNewCert((p) => ({ ...p, year: e.target.value }))} placeholder="Năm (2023)" />
                <button onClick={() => { if (newCert.name) { set("certifications", [...cvData.certifications, { ...newCert, year: +newCert.year || new Date().getFullYear() }]); setNewCert({ name: "", issuer: "", year: "" }); } }} className="text-[12px] text-[#B09BF8] hover:text-t0">+ Thêm chứng chỉ</button>
              </div>

              {/* Projects */}
              <div className="border-t border-border-dark pt-4 space-y-3">
                <p className="text-[12px] font-semibold text-t1">Dự án (cho mẫu Tech/Creative)</p>
                {cvData.projects.map((p, i) => (
                  <div key={i} className="card-dark p-3 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[12px] font-semibold text-t0">{p.name}</span>
                      <button onClick={() => set("projects", cvData.projects.filter((_, idx) => idx !== i))} className="text-[11px] text-red-400">Xóa</button>
                    </div>
                    <p className="text-[11px] text-t1">{p.techStack.join(", ")}</p>
                  </div>
                ))}
                <div className="space-y-2">
                  <input className={inp} value={newProject.name} onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))} placeholder="Tên dự án" />
                  <input className={inp} value={newProject.techStack} onChange={(e) => setNewProject((p) => ({ ...p, techStack: e.target.value }))} placeholder="React, Node.js, PostgreSQL" />
                  <textarea className={textA} rows={2} value={newProject.description} onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))} placeholder="Mô tả dự án..." />
                  <input className={inp} value={newProject.link} onChange={(e) => setNewProject((p) => ({ ...p, link: e.target.value }))} placeholder="github.com/..." />
                </div>
                <button onClick={() => { if (newProject.name) { set("projects", [...cvData.projects, { ...newProject, techStack: newProject.techStack.split(",").map((s) => s.trim()).filter(Boolean) }]); setNewProject({ name: "", description: "", techStack: "", link: "" }); } }} className="text-[12px] text-[#B09BF8] hover:text-t0">+ Thêm dự án</button>
              </div>

              {/* Awards */}
              <div className="border-t border-border-dark pt-4 space-y-3">
                <p className="text-[12px] font-semibold text-t1">Giải thưởng / Hoạt động</p>
                {cvData.awards.map((a, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="flex-1 text-[12px] text-t0">{a}</span>
                    <button onClick={() => set("awards", cvData.awards.filter((_, idx) => idx !== i))} className="text-[11px] text-red-400">×</button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input id="award-inp" className={inp} placeholder="Giải Nhất Hackathon 2023" onKeyDown={(e) => { if (e.key === "Enter") { const v = (e.target as HTMLInputElement).value.trim(); if (v) { set("awards", [...cvData.awards, v]); (e.target as HTMLInputElement).value = ""; } } }} />
                  <button onClick={() => { const el = document.getElementById("award-inp") as HTMLInputElement; const v = el?.value.trim(); if (v) { set("awards", [...cvData.awards, v]); el.value = ""; } }} className="px-3 py-2 rounded-xl bg-[rgba(124,58,237,.12)] text-[#B09BF8] border border-[rgba(124,58,237,.2)] text-[12px] font-semibold">Thêm</button>
                </div>
              </div>

              {/* VN-specific */}
              <div className="border-t border-border-dark pt-4 space-y-3">
                <p className="text-[12px] font-semibold text-t1">Thông tin bổ sung (mẫu VN truyền thống)</p>
                <Field label="Ngày sinh"><input className={inp} value={cvData.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} placeholder="15/08/1997" /></Field>
                <Field label="Giới tính"><input className={inp} value={cvData.gender} onChange={(e) => set("gender", e.target.value)} placeholder="Nam / Nữ" /></Field>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Right: Preview ── */}
      <div className="flex-1 bg-bg-0 overflow-auto flex flex-col">
        <div className="px-6 py-3 border-b border-border-dark flex items-center justify-between">
          <span className="text-[12px] text-t1">Xem trước · A4 PDF</span>
          <div className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: `${template.accentColor}` }} />
            <span className="text-[12px] text-t0 font-semibold">{template.name}</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 flex justify-center">
          <div
            ref={previewRef}
            style={{
              width: 794,
              transformOrigin: "top center",
              boxShadow: "0 4px 40px rgba(0,0,0,.5)",
              flexShrink: 0,
            }}
          >
            <TemplateComp data={cvData} />
          </div>
        </div>
      </div>
    </div>
  );
}
