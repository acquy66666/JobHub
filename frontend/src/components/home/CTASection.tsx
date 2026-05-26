import Link from "next/link";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { SectionTag } from "@/components/common/SectionTag";
import { GradientText } from "@/components/common/GradientText";

export function CTASection() {
  return (
    <section className="py-[110px] px-6 relative overflow-hidden text-center bg-bg-0">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(124,58,237,.18) 0%,transparent 70%)" }} />

      <div className="max-w-wrap mx-auto relative">
        <ScrollReveal className="flex justify-center mb-[22px]">
          <SectionTag>JobHub</SectionTag>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="text-[clamp(38px,5.5vw,64px)] font-black tracking-[-0.04em] leading-[1.06] mb-[18px]">
            Sẵn sàng bứt phá<br /><GradientText>sự nghiệp?</GradientText>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-[17px] text-t1 mb-[38px]">
            Hàng nghìn cơ hội đang chờ bạn. Tạo tài khoản miễn phí ngay hôm nay.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex gap-[14px] justify-center flex-wrap">
            <Link href="/register" className="btn-primary inline-flex items-center gap-[8px] text-[15px] px-7 py-[13px] rounded-[12px]">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              Tạo tài khoản miễn phí
            </Link>
            <Link href="/register?role=EMPLOYER" className="inline-flex items-center gap-[8px] text-[15px] font-semibold text-t0 border border-border-dark px-7 py-[13px] rounded-[12px] hover:border-[rgba(124,58,237,.45)] hover:bg-[rgba(124,58,237,.08)] transition-all">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="7" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
              Đăng tin tuyển dụng
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4} className="mt-[44px] flex items-center justify-center gap-5 flex-wrap">
          <div className="flex items-center gap-[10px]">
            <div className="flex">
              {["A", "B", "C"].map((l, i) => (
                <div key={l} className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-bg-0" style={{ background: ["linear-gradient(135deg,#7C3AED,#3B82F6)", "linear-gradient(135deg,#EC4899,#F59E0B)", "linear-gradient(135deg,#22C55E,#3B82F6)"][i], marginRight: i < 2 ? -7 : 0 }}>{l}</div>
              ))}
            </div>
            <span className="text-[13px] text-t1">50,000+ ứng viên đã tin tưởng JobHub</span>
          </div>
          <div className="w-px h-[18px] bg-border-dark" />
          <div className="flex items-center gap-[6px]">
            <span className="text-[#FCD34D] text-[14px]">★★★★★</span>
            <span className="text-[13px] text-t1">4.9/5 đánh giá trung bình</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
