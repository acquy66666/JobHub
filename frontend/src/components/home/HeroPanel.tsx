"use client";

import { useRouter } from "next/navigation";
import { CmdK } from "@/components/search/CmdK";
import { CapsLabel } from "@/components/ui/CapsLabel";
import { MonoNumber } from "@/components/ui/MonoNumber";

const TRENDING = ["react", "product manager", "designer", "data engineer", "backend node"];

export function HeroPanel() {
  const router = useRouter();
  const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

  return (
    <section className="px-4 md:px-6 pt-28 md:pt-32 pb-16 md:pb-24 max-w-[1280px] mx-auto">
      <CapsLabel tone="accent" className="mb-6">
        JOBHUB / TUYỂN DỤNG
      </CapsLabel>

      <h1 className="text-[clamp(56px,9vw,96px)] font-semibold leading-[0.95] tracking-[-0.03em] text-[var(--t0)] mb-6">
        Tìm việc.<br />
        <span className="text-[var(--accent)]">Ngay.</span>
      </h1>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-10 text-[14px] font-mono text-[var(--t1)]">
        <span>
          <MonoNumber size="sm" tone="default">12,400</MonoNumber> vị trí
        </span>
        <span className="text-[var(--t2)]">·</span>
        <span>
          <MonoNumber size="sm" tone="default">850</MonoNumber> công ty
        </span>
        <span className="text-[var(--t2)]">·</span>
        <span>cập nhật {today}</span>
      </div>

      <div className="max-w-[760px]">
        <CmdK
          size="lg"
          autoFocus={false}
          onSubmit={(raw) => {
            const q = raw.trim();
            router.push(q ? `/jobs?q=${encodeURIComponent(q)}` : "/jobs");
          }}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] font-mono text-[var(--t2)]">
        <span>&gt;</span>
        {TRENDING.map((t, i) => (
          <button
            key={t}
            onClick={() => router.push(`/jobs?q=${encodeURIComponent(t)}`)}
            className="hover:text-[var(--accent)] transition-colors duration-100"
          >
            {t}
            {i < TRENDING.length - 1 && <span className="text-[var(--t2)] ml-2">·</span>}
          </button>
        ))}
      </div>
    </section>
  );
}
