import { ScrollReveal } from "@/components/common/ScrollReveal";
import { SectionTag } from "@/components/common/SectionTag";

const features = [
  { icon: "🔍", bg: "rgba(124,58,237,.14)", title: "Tìm kiếm thông minh", desc: "AI phân tích hồ sơ và gợi ý việc làm phù hợp nhất với kỹ năng và kinh nghiệm của bạn." },
  { icon: "🔒", bg: "rgba(59,130,246,.13)", title: "Bảo mật dữ liệu", desc: "Thông tin cá nhân và CV được mã hóa, chỉ chia sẻ khi bạn chủ động ứng tuyển." },
  { icon: "⚡", bg: "rgba(34,197,94,.11)", title: "Kết nối trực tiếp", desc: "Nhận phản hồi từ nhà tuyển dụng nhanh hơn 3x so với các nền tảng khác." },
  { icon: "📊", bg: "rgba(245,158,11,.11)", title: "Theo dõi đơn ứng tuyển", desc: "Dashboard trực quan hiển thị trạng thái tất cả đơn ứng tuyển theo thời gian thực." },
  { icon: "👤", bg: "rgba(236,72,153,.11)", title: "Hồ sơ chuyên nghiệp", desc: "Tạo profile ấn tượng với kỹ năng, kinh nghiệm, dự án và CV PDF chỉ trong vài phút." },
  { icon: "🔔", bg: "rgba(124,58,237,.14)", title: "Thông báo tức thì", desc: "Email và thông báo ngay khi có tin tuyển dụng mới hoặc cập nhật trạng thái đơn của bạn." },
];

export function FeaturesSection() {
  return (
    <section className="bg-bg-1 border-t border-b border-border-dark py-24">
      <div className="max-w-wrap mx-auto px-6">
        <div className="text-center mb-[60px]">
          <ScrollReveal><SectionTag>Tính năng</SectionTag></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="text-[clamp(30px,4vw,46px)] font-black tracking-[-0.03em] leading-[1.15] mb-[14px]">Được xây dựng khác biệt</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-[16px] text-t1 max-w-[500px] mx-auto leading-[1.75]">
              Không chỉ là bảng việc làm. JobHub là nền tảng tuyển dụng thông minh, bảo mật và hiệu quả nhất Việt Nam.
            </p>
          </ScrollReveal>
        </div>

        {/* Grid with border-separator effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px] bg-border-dark border border-border-dark rounded-[20px] overflow-hidden">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.1}>
              <div className="bg-bg-1 p-[34px_30px] flex flex-col gap-[14px] hover:bg-bg-3 transition-colors h-full">
                <div className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center text-[21px] mb-[2px]" style={{ background: f.bg }}>
                  {f.icon}
                </div>
                <div className="text-[16px] font-bold">{f.title}</div>
                <div className="text-[13px] text-t1 leading-[1.65]">{f.desc}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
