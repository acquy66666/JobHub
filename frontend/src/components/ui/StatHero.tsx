"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { MonoNumber } from "./MonoNumber";

interface Props {
  value: number;
  label: ReactNode;
  format?: (n: number) => string;
  size?: "xl" | "lg";
  duration?: number;
  className?: string;
}

export function StatHero({
  value,
  label,
  format = (n) => n.toLocaleString("vi-VN"),
  size = "xl",
  duration = 800,
  className = "",
}: Props) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setDisplay(Math.round(value * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <div ref={ref} className={`flex flex-col gap-3 ${className}`}>
      <MonoNumber size={size}>{format(display)}</MonoNumber>
      <div className="text-[13px] uppercase tracking-[0.08em] font-semibold text-[var(--t1)]">
        {label}
      </div>
    </div>
  );
}
