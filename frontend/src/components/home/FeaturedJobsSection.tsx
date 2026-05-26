import Link from "next/link";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { SectionTag } from "@/components/common/SectionTag";
import { Bookmark } from "lucide-react";

const jobs = [
  { letter: "G", gradient: "linear-gradient(135deg,#7C3AED,#3B82F6)", company: "Google Vietnam", title: "Senior Frontend Engineer", badges: [{ label: "Full-time", cls: "bg-[rgba(124,58,237,.12)] text-[#B09BF8] border-[rgba(124,58,237,.2)]" }, { label: "Remote", cls: "bg-[rgba(59,130,246,.12)] text-[#60A5FA] border-[rgba(59,130,246,.2)]" }, { label: "$4,000–$6,000", cls: "bg-[rgba(34,197,94,.1)] text-[#4ADE80] border-[rgba(34,197,94,.2)]" }, { label: "Mới đăng", cls: "bg-[rgba(245,158,11,.12)] text-[#FCD34D] border-[rgba(245,158,11,.2)]" }], meta: "📍 Hà Nội · 3 ngày trước · 45 đơn" },
  { letter: "S", gradient: "linear-gradient(135deg,#EC4899,#F59E0B)", company: "Shopee", title: "Product Manager", badges: [{ label: "Full-time", cls: "bg-[rgba(124,58,237,.12)] text-[#B09BF8] border-[rgba(124,58,237,.2)]" }, { label: "📍 TP.HCM", cls: "bg-white/[.05] text-t1 border-border-dark" }, { label: "$3,500–$5,000", cls: "bg-[rgba(34,197,94,.1)] text-[#4ADE80] border-[rgba(34,197,94,.2)]" }], meta: "🏢 On-site · 5 ngày trước · 120 đơn" },
  { letter: "V", gradient: "linear-gradient(135deg,#22C55E,#3B82F6)", company: "VNG Corporation", title: "Data Engineer", badges: [{ label: "Full-time", cls: "bg-[rgba(124,58,237,.12)] text-[#B09BF8] border-[rgba(124,58,237,.2)]" }, { label: "Hybrid", cls: "bg-[rgba(59,130,246,.12)] text-[#60A5FA] border-[rgba(59,130,246,.2)]" }, { label: "$2,500–$4,000", cls: "bg-[rgba(34,197,94,.1)] text-[#4ADE80] border-[rgba(34,197,94,.2)]" }], meta: "📍 TP.HCM · 1 tuần trước · 78 đơn" },
  { letter: "M", gradient: "linear-gradient(135deg,#F59E0B,#EF4444)", company: "MoMo", title: "iOS Developer", badges: [{ label: "Full-time", cls: "bg-[rgba(124,58,237,.12)] text-[#B09BF8] border-[rgba(124,58,237,.2)]" }, { label: "📍 Hà Nội", cls: "bg-white/[.05] text-t1 border-border-dark" }, { label: "$2,000–$3,500", cls: "bg-[rgba(34,197,94,.1)] text-[#4ADE80] border-[rgba(34,197,94,.2)]" }, { label: "Mới đăng", cls: "bg-[rgba(245,158,11,.12)] text-[#FCD34D] border-[rgba(245,158,11,.2)]" }], meta: "🏢 On-site · 2 ngày trước · 32 đơn" },
  { letter: "Z", gradient: "linear-gradient(135deg,#3B82F6,#22C55E)", company: "Zalo / VNG", title: "UX Designer", badges: [{ label: "Full-time", cls: "bg-[rgba(124,58,237,.12)] text-[#B09BF8] border-[rgba(124,58,237,.2)]" }, { label: "Remote", cls: "bg-[rgba(59,130,246,.12)] text-[#60A5FA] border-[rgba(59,130,246,.2)]" }, { label: "$1,800–$3,000", cls: "bg-[rgba(34,197,94,.1)] text-[#4ADE80] border-[rgba(34,197,94,.2)]" }], meta: "📍 Toàn quốc · 4 ngày trước · 95 đơn" },
  { letter: "T", gradient: "linear-gradient(135deg,#8B5CF6,#EC4899)", company: "Tiki Corporation", title: "Backend Engineer (Node.js)", badges: [{ label: "Full-time", cls: "bg-[rgba(124,58,237,.12)] text-[#B09BF8] border-[rgba(124,58,237,.2)]" }, { label: "Hybrid", cls: "bg-[rgba(59,130,246,.12)] text-[#60A5FA] border-[rgba(59,130,246,.2)]" }, { label: "$2,200–$3,800", cls: "bg-[rgba(34,197,94,.1)] text-[#4ADE80] border-[rgba(34,197,94,.2)]" }], meta: "📍 TP.HCM · 6 ngày trước · 61 đơn" },
];

export function FeaturedJobsSection() {
  return (
    <section className="py-24 bg-bg-0" id="jobs">
      <div className="max-w-wrap mx-auto px-6">
        <div className="text-center mb-[60px]">
          <ScrollReveal><SectionTag>Việc làm nổi bật</SectionTag></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="text-[clamp(30px,4vw,46px)] font-black tracking-[-0.03em] leading-[1.15] mb-[14px]">Cơ hội dành cho bạn</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-[16px] text-t1 max-w-[500px] mx-auto leading-[1.75]">
              Hàng nghìn vị trí từ các công ty hàng đầu đang chờ ứng viên phù hợp.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] mb-9">
          {jobs.map((job, i) => (
            <ScrollReveal key={job.title} delay={i * 0.1}>
              <div className="card-dark p-[22px] flex flex-col gap-[14px] cursor-pointer">
                {/* Header */}
                <div className="flex items-start justify-between gap-[14px]">
                  <div className="flex items-center gap-[11px]">
                    <div className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center text-[16px] font-black text-white shrink-0" style={{ background: job.gradient }}>
                      {job.letter}
                    </div>
                    <div>
                      <div className="text-[12px] text-t2 mb-[2px]">{job.company}</div>
                      <div className="text-[16px] font-bold">{job.title}</div>
                    </div>
                  </div>
                  <button className="w-[34px] h-[34px] rounded-[9px] bg-white/[.05] border border-border-dark flex items-center justify-center shrink-0 hover:bg-[rgba(124,58,237,.15)] hover:border-[rgba(124,58,237,.3)] transition-all">
                    <Bookmark size={13} className="text-t1" />
                  </button>
                </div>

                {/* Badges */}
                <div className="flex gap-[7px] flex-wrap">
                  {job.badges.map((b) => (
                    <span key={b.label} className={`text-[11px] font-medium px-[10px] py-1 rounded-[7px] border ${b.cls}`}>{b.label}</span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-[14px] border-t border-border-dark">
                  <span className="text-[11px] text-t2">{job.meta}</span>
                  <button className="bg-brand-gradient text-white text-[12px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 hover:-translate-y-px transition-all">
                    Ứng tuyển
                  </button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="text-center">
          <Link href="/jobs" className="inline-flex items-center text-[15px] font-semibold text-t0 border border-border-dark px-7 py-[13px] rounded-[12px] hover:border-[rgba(124,58,237,.45)] hover:bg-[rgba(124,58,237,.08)] transition-all">
            Xem tất cả 12,400+ việc làm →
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
