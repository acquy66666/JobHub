import Link from "next/link";
import { HairlineSection } from "@/components/ui/HairlineSection";

export function CTAPanel() {
  return (
    <HairlineSection className="max-w-[1280px] mx-auto" bottomRule>
      <div className="px-4 md:px-6 py-16 md:py-24">
        <h2 className="text-[clamp(32px,5vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[var(--t0)] mb-10 max-w-[720px]">
          Sẵn sàng bắt đầu?
        </h2>
        <div className="flex flex-col gap-4 font-mono text-[15px]">
          <Link
            href="/register"
            className="group flex items-baseline gap-3 text-[var(--t0)] hover:text-[var(--accent)] transition-colors duration-100"
          >
            <span className="text-[var(--accent)]">&gt;</span>
            <span className="underline-offset-4 group-hover:underline">
              Tôi là ứng viên — tìm việc miễn phí
            </span>
            <span className="text-[var(--t2)]">/register</span>
          </Link>
          <Link
            href="/employer/register"
            className="group flex items-baseline gap-3 text-[var(--t0)] hover:text-[var(--accent)] transition-colors duration-100"
          >
            <span className="text-[var(--accent)]">&gt;</span>
            <span className="underline-offset-4 group-hover:underline">
              Tôi là nhà tuyển dụng — đăng tin
            </span>
            <span className="text-[var(--t2)]">/employer/register</span>
          </Link>
        </div>
      </div>
    </HairlineSection>
  );
}
