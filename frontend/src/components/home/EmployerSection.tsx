import Link from "next/link";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { SectionTag } from "@/components/common/SectionTag";
import { GradientText } from "@/components/common/GradientText";

const features = [
  { icon: "📢", title: "Đăng tin nhanh chóng", desc: "Tạo tin tuyển dụng chuyên nghiệp trong 5 phút. Tiếp cận hàng nghìn ứng viên ngay lập tức." },
  { icon: "🎯", title: "Lọc hồ sơ thông minh", desc: "Bộ lọc đa chiều theo kỹ năng, kinh nghiệm, địa điểm giúp tìm đúng ứng viên trong hàng trăm đơn." },
  { icon: "📈", title: "Dashboard phân tích", desc: "Theo dõi số lượt xem, tỷ lệ ứng tuyển và hiệu quả chiến dịch tuyển dụng theo thời gian thực." },
  { icon: "✉️", title: "Thông báo tự động", desc: "Email tự động gửi đến ứng viên khi cập nhật trạng thái. Chuyên nghiệp, không tốn thêm công sức." },
];

const candidates = [
  { initials: "NH", gradient: "linear-gradient(135deg,#7C3AED,#3B82F6)", name: "Nguyễn Hoàng", role: "Senior Frontend · 5 năm KN", statusLabel: "Phù hợp", statusCls: "bg-[rgba(34,197,94,.12)] text-[#4ADE80]" },
  { initials: "TL", gradient: "linear-gradient(135deg,#EC4899,#F59E0B)", name: "Trần Lan", role: "Product Designer · 3 năm KN", statusLabel: "Đang xem", statusCls: "bg-[rgba(245,158,11,.12)] text-[#FCD34D]" },
  { initials: "PD", gradient: "linear-gradient(135deg,#22C55E,#3B82F6)", name: "Phạm Dũng", role: "Data Engineer · 4 năm KN", statusLabel: "Phỏng vấn", statusCls: "bg-[rgba(59,130,246,.12)] text-[#60A5FA]" },
  { initials: "LM", gradient: "linear-gradient(135deg,#8B5CF6,#EC4899)", name: "Lê Minh", role: "Backend Engineer · 2 năm KN", statusLabel: "Đang xét", statusCls: "bg-[rgba(124,58,237,.12)] text-[#B09BF8]" },
];

export function EmployerSection() {
  return (
    <section className="py-24 bg-bg-1 border-t border-b border-border-dark" id="employers">
      <div className="max-w-wrap mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[72px] items-center">
          {/* Left: text */}
          <div>
            <ScrollReveal><SectionTag>Dành cho nhà tuyển dụng</SectionTag></ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="text-[clamp(30px,4vw,46px)] font-black tracking-[-0.03em] leading-[1.15] mb-[14px]">
                Tìm ứng viên phù hợp<br /><GradientText>nhanh hơn</GradientText>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-[16px] text-t1 leading-[1.75] mb-7">
                Công cụ quản lý tuyển dụng toàn diện. Đăng tin, lọc hồ sơ và theo dõi ứng viên trên một nền tảng.
              </p>
            </ScrollReveal>
            <div className="flex flex-col gap-[18px]">
              {features.map((f, i) => (
                <ScrollReveal key={f.title} delay={0.1 * (i + 1)}>
                  <div className="flex gap-[15px] items-start">
                    <div className="w-[42px] h-[42px] rounded-[12px] bg-[rgba(124,58,237,.11)] border border-[rgba(124,58,237,.2)] flex items-center justify-center text-[17px] shrink-0">{f.icon}</div>
                    <div>
                      <h4 className="text-[15px] font-semibold mb-[3px]">{f.title}</h4>
                      <p className="text-[13px] text-t1 leading-[1.6]">{f.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal delay={0.3} className="mt-7">
              <Link href="/register?role=EMPLOYER" className="btn-primary inline-flex items-center text-[15px] px-7 py-[13px] rounded-[12px]">
                Đăng tin miễn phí →
              </Link>
            </ScrollReveal>
          </div>

          {/* Right: employer mockup */}
          <ScrollReveal direction="right">
            <div className="bg-bg-2 border border-border-dark rounded-[18px] overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,.5)]">
              <div className="bg-bg-1 border-b border-border-dark px-[18px] py-[14px] flex items-center justify-between">
                <span className="text-[13px] font-semibold">Dashboard Nhà tuyển dụng</span>
                <span className="text-[11px] font-medium px-[9px] py-[3px] rounded-[6px] bg-[rgba(245,158,11,.12)] text-[#FCD34D] border border-[rgba(245,158,11,.2)]">● Live</span>
              </div>
              <div className="p-[18px] flex flex-col gap-[11px]">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-[9px]">
                  {[
                    { value: "24", color: "gradient-text", label: "Tin đang chạy" },
                    { value: "142", color: "text-[#4ADE80]", label: "Đơn mới tuần này" },
                    { value: "3.2K", color: "text-[#FCD34D]", label: "Lượt xem" },
                  ].map((s) => (
                    <div key={s.label} className="bg-bg-1 rounded-[9px] p-[13px] text-center">
                      <div className={`text-[20px] font-black tracking-[-0.02em] ${s.color}`}>{s.value}</div>
                      <div className="text-[10px] text-t2 mt-[2px]">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="text-[12px] font-semibold text-t2 mt-[2px]">Ứng viên gần đây</div>
                <div className="flex flex-col gap-[7px]">
                  {candidates.map((c) => (
                    <div key={c.initials} className="bg-bg-1 rounded-[9px] px-[13px] py-[10px] flex items-center gap-[10px]">
                      <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: c.gradient }}>{c.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold">{c.name}</div>
                        <div className="text-[10px] text-t2">{c.role}</div>
                      </div>
                      <span className={`text-[10px] font-semibold px-[9px] py-[3px] rounded-[6px] ${c.statusCls}`}>{c.statusLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
