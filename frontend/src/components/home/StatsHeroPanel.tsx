import { StatHero } from "@/components/ui/StatHero";
import { MonoNumber } from "@/components/ui/MonoNumber";
import { HairlineSection } from "@/components/ui/HairlineSection";

export function StatsHeroPanel() {
  return (
    <HairlineSection label="QUY MÔ" className="max-w-[1280px] mx-auto">
      <div className="px-4 md:px-6 py-12 md:py-20 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12 md:gap-20 items-end">
        <StatHero value={12847} label="VỊ TRÍ ĐANG TUYỂN" size="xl" />
        <div className="flex flex-col gap-8 pb-2">
          <div className="flex items-baseline justify-between border-b border-[var(--border)] pb-3">
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--t1)]">Công ty</span>
            <MonoNumber size="lg">850</MonoNumber>
          </div>
          <div className="flex items-baseline justify-between border-b border-[var(--border)] pb-3">
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--t1)]">Hài lòng</span>
            <MonoNumber size="lg" tone="success">95%</MonoNumber>
          </div>
          <div className="flex items-baseline justify-between border-b border-[var(--border)] pb-3">
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--t1)]">Ứng viên</span>
            <MonoNumber size="lg">50K+</MonoNumber>
          </div>
        </div>
      </div>
    </HairlineSection>
  );
}
