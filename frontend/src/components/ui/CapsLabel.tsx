import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  tone?: "default" | "accent" | "muted";
}

export function CapsLabel({ children, className = "", tone = "default" }: Props) {
  const toneClass =
    tone === "accent"
      ? "text-[var(--accent)]"
      : tone === "muted"
      ? "text-[var(--t2)]"
      : "text-[var(--t1)]";
  return (
    <span
      className={`inline-block text-[11px] font-semibold uppercase tracking-[0.08em] ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
