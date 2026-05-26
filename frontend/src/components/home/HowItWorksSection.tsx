import { ScrollReveal } from "@/components/common/ScrollReveal";
import { SectionTag } from "@/components/common/SectionTag";

const steps = [
  { num: "01", title: "Tạo hồ sơ của bạn", desc: "Đăng ký tài khoản, điền thông tin cá nhân, kỹ năng, kinh nghiệm và upload CV PDF. Chỉ mất 5 phút." },
  { num: "02", title: "Tìm & ứng tuyển", desc: "Dùng bộ lọc thông minh theo ngành nghề, địa điểm, mức lương. Nộp đơn 1-click kèm cover letter." },
  { num: "03", title: "Nhận công việc", desc: "Theo dõi trạng thái đơn thời gian thực. Nhận thông báo ngay khi có phản hồi và chuẩn bị phỏng vấn." },
];

export function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="max-w-wrap mx-auto px-6">
        <div className="text-center mb-[60px]">
          <ScrollReveal><SectionTag>Hướng dẫn</SectionTag></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="text-[clamp(30px,4vw,46px)] font-black tracking-[-0.03em] leading-[1.15] mb-[14px]">
              3 bước để có việc làm<br />mơ ước
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-[16px] text-t1 max-w-[500px] mx-auto leading-[1.75]">
              Quy trình đơn giản, không rắc rối. Từ đăng ký đến nhận offer chỉ trong vài ngày.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
          {steps.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.2}>
              <div className="relative bg-bg-2 border border-border-dark rounded-[20px] p-[34px_26px] overflow-hidden group hover:border-[rgba(124,58,237,.35)] transition-colors">
                {/* Gradient top border on hover */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="gradient-text text-[56px] font-black tracking-[-0.04em] leading-none opacity-[.28] mb-[18px]">
                  {step.num}
                </div>
                <div className="text-[19px] font-bold mb-[10px]">{step.title}</div>
                <div className="text-[13px] text-t1 leading-[1.65]">{step.desc}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
