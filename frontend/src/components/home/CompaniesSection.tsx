import Link from "next/link";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { SectionTag } from "@/components/common/SectionTag";

const companies = [
  { letter: "G", gradient: "linear-gradient(135deg,#7C3AED,#3B82F6)", name: "Google Vietnam", industry: "Công nghệ · Tìm kiếm", jobs: 18 },
  { letter: "S", gradient: "linear-gradient(135deg,#EC4899,#F59E0B)", name: "Shopee", industry: "E-commerce · FinTech", jobs: 42 },
  { letter: "V", gradient: "linear-gradient(135deg,#22C55E,#3B82F6)", name: "VNG Corporation", industry: "Gaming · Công nghệ", jobs: 35 },
  { letter: "M", gradient: "linear-gradient(135deg,#F59E0B,#EF4444)", name: "MoMo", industry: "FinTech · Mobile", jobs: 27 },
  { letter: "Z", gradient: "linear-gradient(135deg,#3B82F6,#22C55E)", name: "Zalo / VNG", industry: "Social · Messaging", jobs: 21 },
  { letter: "T", gradient: "linear-gradient(135deg,#8B5CF6,#EC4899)", name: "Tiki", industry: "E-commerce · Logistics", jobs: 33 },
  { letter: "B", gradient: "linear-gradient(135deg,#14B8A6,#3B82F6)", name: "Baemin", industry: "Food Delivery · Tech", jobs: 15 },
  { letter: "G", gradient: "linear-gradient(135deg,#EF4444,#F59E0B)", name: "Grab Vietnam", industry: "SuperApp · Transport", jobs: 29 },
];

export function CompaniesSection() {
  return (
    <section className="py-24 bg-bg-1 border-t border-b border-border-dark" id="companies">
      <div className="max-w-wrap mx-auto px-6">
        <div className="text-center mb-[60px]">
          <ScrollReveal><SectionTag>Công ty đối tác</SectionTag></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="text-[clamp(30px,4vw,46px)] font-black tracking-[-0.03em] leading-[1.15] mb-[14px]">
              Làm việc cùng những<br />công ty hàng đầu
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-[16px] text-t1 max-w-[500px] mx-auto leading-[1.75]">
              Từ startup công nghệ đến tập đoàn đa quốc gia, cơ hội của bạn đang chờ.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          {companies.map((c, i) => (
            <ScrollReveal key={`${c.name}-${i}`} delay={i * 0.07}>
              <div className="bg-bg-2 border border-border-dark rounded-[15px] p-[22px] flex flex-col gap-[13px] cursor-pointer hover:border-[rgba(124,58,237,.3)] hover:-translate-y-0.5 transition-all h-full">
                <div className="w-[50px] h-[50px] rounded-[13px] flex items-center justify-center text-[20px] font-black text-white" style={{ background: c.gradient }}>
                  {c.letter}
                </div>
                <div>
                  <div className="text-[14px] font-bold">{c.name}</div>
                  <div className="text-[11px] text-t2 mt-[2px]">{c.industry}</div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[12px] text-[#B09BF8] font-medium">{c.jobs} vị trí mở</span>
                  <span className="text-[12px] text-t2">→</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="text-center mt-9">
          <Link href="/companies" className="inline-flex items-center text-[15px] font-semibold text-t0 border border-border-dark px-7 py-[13px] rounded-[12px] hover:border-[rgba(124,58,237,.45)] hover:bg-[rgba(124,58,237,.08)] transition-all">
            Xem tất cả 850+ công ty →
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
