"use client";
import Link from "next/link";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { GradientText } from "@/components/common/GradientText";

const trendingTags = ["Frontend Developer", "Product Manager", "UI/UX Designer", "Data Analyst", "Backend Engineer"];

const mockJobs = [
  { letter: "G", gradient: "linear-gradient(135deg,#7C3AED,#3B82F6)", title: "Senior Frontend Dev", company: "Google Vietnam", badges: [{ label: "Full-time", style: "bg-[rgba(124,58,237,.15)] text-[#B09BF8]" }, { label: "Remote", style: "bg-[rgba(34,197,94,.1)] text-[#4ADE80]" }], salary: "$3,000–$5,000/tháng" },
  { letter: "S", gradient: "linear-gradient(135deg,#EC4899,#F59E0B)", title: "Product Designer", company: "Shopee", badges: [{ label: "Hybrid", style: "bg-[rgba(59,130,246,.15)] text-[#60A5FA]" }, { label: "Mới", style: "bg-[rgba(245,158,11,.1)] text-[#FCD34D]" }], salary: "$2,000–$3,500/tháng" },
  { letter: "V", gradient: "linear-gradient(135deg,#22C55E,#3B82F6)", title: "Data Engineer", company: "VNG Corporation", badges: [{ label: "Full-time", style: "bg-[rgba(124,58,237,.15)] text-[#B09BF8]" }, { label: "HCM", style: "bg-[rgba(255,255,255,.05)] text-t1" }], salary: "$2,500–$4,000/tháng" },
  { letter: "M", gradient: "linear-gradient(135deg,#F59E0B,#EF4444)", title: "iOS Developer", company: "MoMo", badges: [{ label: "Full-time", style: "bg-[rgba(124,58,237,.15)] text-[#B09BF8]" }, { label: "Hà Nội", style: "bg-[rgba(255,255,255,.05)] text-t1" }], salary: "$2,000–$3,000/tháng" },
];

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-[130px] pb-20 px-6 relative overflow-hidden">
      {/* Backgrounds */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 40%,black 0%,transparent 100%)",
          }}
        />
        <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full" style={{ background: "radial-gradient(ellipse,rgba(124,58,237,.18) 0%,transparent 68%)" }} />
        <div className="absolute top-[30%] -right-[180px] w-[520px] h-[520px] rounded-full" style={{ background: "radial-gradient(ellipse,rgba(59,130,246,.1) 0%,transparent 70%)" }} />
        <div className="absolute -bottom-[60px] -left-[160px] w-[480px] h-[420px] rounded-full" style={{ background: "radial-gradient(ellipse,rgba(124,58,237,.09) 0%,transparent 70%)" }} />
      </div>

      {/* Main content */}
      <ScrollReveal className="relative text-center max-w-[780px] mx-auto">
        {/* Live badge */}
        <div className="inline-flex items-center gap-[9px] bg-[rgba(124,58,237,.09)] border border-[rgba(124,58,237,.2)] text-[#B09BF8] text-[13px] font-medium px-[18px] py-2 rounded-full mb-[30px] animate-[pborder_3s_ease_infinite]"
          style={{ animation: "pborder 3s ease infinite" }}>
          <style>{`@keyframes pborder{0%,100%{border-color:rgba(124,58,237,.2)}50%{border-color:rgba(124,58,237,.45)}}`}</style>
          <span className="w-2 h-2 bg-success rounded-full animate-blink" style={{ boxShadow: "0 0 8px #22C55E" }} />
          10,000+ việc làm mới mỗi tháng
        </div>

        <h1 className="text-[clamp(46px,7vw,74px)] font-black leading-[1.05] tracking-[-0.035em] mb-[22px]">
          Tìm việc mơ ước.<br />
          <GradientText>Ngay hôm nay.</GradientText>
        </h1>
        <p className="text-[17px] text-t1 max-w-[500px] mx-auto mb-9 leading-[1.75]">
          JobHub kết nối ứng viên tài năng với nhà tuyển dụng hàng đầu Việt Nam. Nhanh chóng, thông minh, bảo mật.
        </p>

        {/* Search bar */}
        <ScrollReveal delay={0.2} className="max-w-[600px] mx-auto mb-7">
          <div className="flex items-center bg-bg-2 border border-border-dark rounded-[14px] pl-[18px] pr-[6px] py-[6px] shadow-[0_10px_50px_rgba(0,0,0,.35)] focus-within:border-[rgba(124,58,237,.5)] focus-within:shadow-[0_0_0_3px_rgba(124,58,237,.1),0_10px_50px_rgba(0,0,0,.35)] transition-all">
            <svg className="text-t2 shrink-0" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input className="flex-1 bg-transparent border-none outline-none text-t0 font-[inherit] text-[15px] px-3 py-2 placeholder:text-t2" type="text" placeholder="Vị trí, kỹ năng, công ty..." />
            <div className="w-px h-[26px] bg-border-dark mx-[14px]" />
            <div className="flex items-center gap-[6px] text-t2 text-[13px] whitespace-nowrap">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              Hà Nội, VN
            </div>
            <button className="btn-primary ml-[10px] flex items-center gap-[7px] text-[14px] px-[22px] py-[11px] rounded-[10px] shrink-0">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              Tìm kiếm
            </button>
          </div>
        </ScrollReveal>

        {/* Trending tags */}
        <ScrollReveal delay={0.3} className="flex items-center justify-center gap-2 flex-wrap mb-[52px]">
          <span className="text-t2 text-[13px]">Phổ biến:</span>
          {trendingTags.map((tag) => (
            <button key={tag} className="bg-white/[.04] border border-border-dark text-t1 text-[13px] px-3 py-[5px] rounded-lg hover:border-[rgba(124,58,237,.4)] hover:text-t0 hover:bg-[rgba(124,58,237,.08)] transition-all whitespace-nowrap">
              {tag}
            </button>
          ))}
        </ScrollReveal>
      </ScrollReveal>

      {/* Dashboard mockup */}
      <div className="relative w-full max-w-wrap px-6 mx-auto">
        <ScrollReveal direction="scale" delay={0.4} className="max-w-[880px] mx-auto">
          <div className="bg-bg-2 border border-border-dark rounded-2xl overflow-hidden shadow-[0_40px_110px_rgba(0,0,0,.65),0_0_0_1px_rgba(255,255,255,.04)]">
            {/* Window chrome */}
            <div className="bg-bg-1 px-4 py-[13px] flex items-center gap-2 border-b border-border-dark">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              <div className="flex-1 bg-white/[.04] rounded-[6px] h-[26px] flex items-center px-3 text-[11px] text-t2 mx-3">
                <svg className="mr-[5px]" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                jobhub.vn/dashboard
              </div>
            </div>
            {/* Window body */}
            <div className="p-4 grid grid-cols-[200px_1fr] gap-[14px] min-h-[320px]">
              <div className="bg-bg-1 rounded-[10px] p-3 hidden md:flex flex-col gap-1">
                {[["🏠", "Dashboard", true], ["💼", "Việc làm", false], ["📄", "Hồ sơ", false], ["❤️", "Đã lưu", false], ["📊", "Đơn ứng tuyển", false]].map(([icon, label, active]) => (
                  <div key={label as string} className={`flex items-center gap-[9px] px-[11px] py-[9px] rounded-lg text-[12px] cursor-pointer ${active ? "bg-[rgba(124,58,237,.14)] text-[#B09BF8]" : "text-t2"}`}>
                    <div className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-[10px] ${active ? "bg-[rgba(124,58,237,.28)]" : "bg-white/[.07]"}`}>{icon}</div>
                    {label}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-[10px]">
                <div className="bg-bg-1 rounded-[9px] h-10 flex items-center px-[14px] gap-[9px] text-[12px] text-t2">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                  Tìm kiếm việc làm phù hợp...
                </div>
                <div className="grid grid-cols-2 gap-[9px] flex-1">
                  {mockJobs.map((job, i) => (
                    <div key={i} className={`bg-bg-1 border rounded-[9px] p-[13px] flex flex-col gap-[9px] ${i === 0 ? "border-[rgba(124,58,237,.28)] bg-[rgba(124,58,237,.04)]" : "border-border-dark"}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-[7px] flex items-center justify-center text-[11px] font-black text-white shrink-0" style={{ background: job.gradient }}>{job.letter}</div>
                        <div>
                          <div className="text-[11px] font-semibold text-t0">{job.title}</div>
                          <div className="text-[10px] text-t2">{job.company}</div>
                        </div>
                      </div>
                      <div className="flex gap-[5px] flex-wrap">
                        {job.badges.map((b, j) => (
                          <span key={j} className={`text-[9px] px-[7px] py-[2px] rounded-[5px] font-medium ${b.style}`}>{b.label}</span>
                        ))}
                      </div>
                      <div className="text-[10px] text-t1">{job.salary}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Stats bar */}
        <ScrollReveal delay={0.5}>
          <div className="flex items-center justify-center gap-10 py-7 border-t border-b border-border-dark mt-[50px] flex-wrap gap-y-4">
            {[
              { value: "12,400+", label: "Việc làm đang tuyển" },
              { value: "850+", label: "Công ty đối tác" },
              { value: "95%", label: "Tỷ lệ hài lòng" },
              { value: "50K+", label: "Ứng viên thành công" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="gradient-text text-[30px] font-black tracking-[-0.03em] leading-none mb-1">{stat.value}</div>
                <div className="text-[12px] text-t2">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
