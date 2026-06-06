"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { GradientText } from "@/components/common/GradientText";
import { skillsApi, type SkillCategory, CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/api/skills";
import { queryKeys } from "@/lib/queryKeys";
import api from "@/lib/api";

const CATEGORY_ICON: Record<SkillCategory, string> = {
  IT: "💻",
  KY_THUAT: "⚙️",
  KINH_TE: "📊",
  MARKETING: "📣",
  Y_TE: "🩺",
  SU_PHAM: "🎓",
  THIET_KE: "🎨",
  NGON_NGU: "🌐",
  KY_NANG_MEM: "🤝",
  KHAC: "✨",
};

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState<SkillCategory | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const { data: trending = [], isLoading } = useQuery({
    queryKey: ["skills", "trending", category, 10],
    queryFn: () => skillsApi.listTrending(10, category ?? undefined),
    enabled: step === 2 && !!category,
    staleTime: 5 * 60 * 1000,
  });

  const toggleSkill = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") window.localStorage.setItem("onboarding_skipped", "1");
    router.replace("/candidate/dashboard");
  };

  const handleSave = async () => {
    if (selected.size === 0) {
      handleSkip();
      return;
    }
    setSaving(true);
    try {
      await api.put("/candidate/profile", { skills: Array.from(selected) });
      if (typeof window !== "undefined") window.localStorage.setItem("onboarding_skipped", "1");
      await queryClient.invalidateQueries({ queryKey: queryKeys.candidateProfile() });
      router.replace("/candidate/dashboard");
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(124,58,237,.12) 0%,transparent 70%)" }} />
      <ScrollReveal className="relative w-full max-w-[720px]">
        <div className="bg-bg-2 border border-border-dark rounded-[20px] p-6 md:p-10">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? "bg-brand-gradient" : "bg-border-dark"}`} />
            ))}
          </div>

          {step === 1 ? (
            <>
              <h2 className="text-[clamp(22px,3vw,28px)] font-extrabold tracking-[-0.025em] mb-2">
                Bạn quan tâm <GradientText>ngành nào</GradientText>?
              </h2>
              <p className="text-[14px] text-t1 mb-6">Chọn ngành phù hợp để chúng tôi gợi ý kỹ năng nổi bật cho bạn.</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {CATEGORY_ORDER.map((c) => {
                  const active = category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`p-4 rounded-[14px] border text-left transition-all hover:-translate-y-0.5 ${active ? "border-primary bg-[rgba(124,58,237,.08)] shadow-[0_0_0_1px_rgba(124,58,237,.3)]" : "border-border-dark bg-bg-3 hover:border-[rgba(124,58,237,.3)]"}`}
                    >
                      <div className="text-[22px] mb-2">{CATEGORY_ICON[c]}</div>
                      <div className={`text-[13px] font-semibold ${active ? "text-t0" : "text-t1"}`}>{CATEGORY_LABEL[c]}</div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-between">
                <button onClick={handleSkip} className="px-5 py-3 rounded-[12px] text-[14px] text-t1 hover:text-t0 transition-colors">
                  Bỏ qua
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!category}
                  className="btn-primary px-6 py-3 rounded-[12px] text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp theo →
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-[clamp(22px,3vw,28px)] font-extrabold tracking-[-0.025em] mb-2">
                Kỹ năng <GradientText>nổi bật</GradientText> ngành {category ? CATEGORY_LABEL[category] : ""}
              </h2>
              <p className="text-[14px] text-t1 mb-6">
                Chọn các kỹ năng bạn có. Bạn có thể cập nhật thêm sau trong hồ sơ.
                {selected.size > 0 && <span className="ml-2 text-[#B09BF8] font-semibold">Đã chọn: {selected.size}</span>}
              </p>

              {isLoading ? (
                <div className="py-12 text-center text-t1 text-[14px]">Đang tải kỹ năng...</div>
              ) : trending.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-t1 text-[14px] mb-3">Chưa có kỹ năng phổ biến cho ngành này.</p>
                  <p className="text-t2 text-[12px]">Bạn có thể bỏ qua và tự thêm kỹ năng trong hồ sơ.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-8" data-testid="trending-chips">
                  {trending.map((skill) => {
                    const active = selected.has(skill.slug);
                    return (
                      <button
                        key={skill.slug}
                        type="button"
                        onClick={() => toggleSkill(skill.slug)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-medium transition-all ${active ? "bg-[rgba(124,58,237,.18)] border-[rgba(124,58,237,.5)] text-t0" : "bg-bg-3 border-border-dark text-t1 hover:border-[rgba(124,58,237,.3)]"}`}
                      >
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${active ? "bg-[#7C3AED] border-[#7C3AED]" : "border-border-dark"}`}>
                          {active && <span className="text-white text-[10px]">✓</span>}
                        </span>
                        {skill.nameVi}
                        {skill.jobCount > 0 && (
                          <span className="text-[10px] text-[#4ADE80] bg-[rgba(34,197,94,.08)] border border-[rgba(34,197,94,.2)] rounded px-1.5 py-0.5">
                            {skill.jobCount} tin
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3 justify-between">
                <button onClick={() => setStep(1)} className="px-5 py-3 rounded-[12px] border border-border-dark text-t1 text-[14px] font-semibold hover:border-white/[.14] hover:text-t0 transition-all">
                  ← Quay lại
                </button>
                <div className="flex gap-3">
                  <button onClick={handleSkip} className="px-5 py-3 rounded-[12px] text-[14px] text-t1 hover:text-t0 transition-colors">
                    Bỏ qua
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary px-6 py-3 rounded-[12px] text-[14px] font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? "Đang lưu..." : selected.size > 0 ? `Lưu ${selected.size} kỹ năng →` : "Hoàn tất"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
