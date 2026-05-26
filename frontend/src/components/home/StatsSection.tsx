"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { SectionTag } from "@/components/common/SectionTag";
import { GradientText } from "@/components/common/GradientText";

const stats = [
  { target: 12400, suffix: "+", label: "Việc làm đang tuyển", sub: "Cập nhật mỗi ngày", color: "gradient-text" },
  { target: 850, suffix: "+", label: "Công ty đối tác", sub: "Từ startup đến tập đoàn", color: "text-[#4ADE80]" },
  { target: 50000, suffix: "+", label: "Ứng viên đăng ký", sub: "Trong năm 2024", color: "text-[#FCD34D]" },
  { target: 95, suffix: "%", label: "Tỷ lệ hài lòng", sub: "Đánh giá từ người dùng", color: "text-[#F472B6]" },
];

function AnimatedCounter({ target, suffix, color }: { target: number; suffix: string; color: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const step = target / 55;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      setCount(Math.floor(current));
    }, 18);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div ref={ref} className={`text-[44px] font-black tracking-[-0.04em] leading-none mb-2 ${color}`}>
      {count.toLocaleString("vi-VN")}{suffix}
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="py-24">
      <div className="max-w-wrap mx-auto px-6">
        <div className="text-center mb-[60px]">
          <ScrollReveal><SectionTag>Con số ấn tượng</SectionTag></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="text-[clamp(30px,4vw,46px)] font-black tracking-[-0.03em] leading-[1.15]">
              JobHub trong <GradientText>con số</GradientText>
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-border-dark border border-border-dark rounded-[20px] overflow-hidden">
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 0.1}>
              <div className="bg-bg-2 px-7 py-[38px] text-center h-full">
                <AnimatedCounter target={s.target} suffix={s.suffix} color={s.color} />
                <div className="text-[14px] text-t1">{s.label}</div>
                <div className="text-[11px] text-t2 mt-1">{s.sub}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
