import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  size?: "xl" | "lg" | "md" | "sm";
  className?: string;
  tone?: "default" | "accent" | "muted" | "success" | "danger";
}

const sizeMap = {
  xl: "text-[clamp(80px,14vw,160px)] font-medium leading-none tracking-[-0.02em]",
  lg: "text-[36px] font-medium leading-none tracking-[-0.01em]",
  md: "text-[20px] font-medium leading-tight",
  sm: "text-[13px] font-normal leading-tight",
} as const;

const toneMap = {
  default: "text-[var(--t0)]",
  accent: "text-[var(--accent)]",
  muted: "text-[var(--t1)]",
  success: "text-[var(--green)]",
  danger: "text-[var(--red)]",
} as const;

export function MonoNumber({
  children,
  size = "md",
  className = "",
  tone = "default",
}: Props) {
  return (
    <span
      className={`font-mono tabular-nums ${sizeMap[size]} ${toneMap[tone]} ${className}`}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {children}
    </span>
  );
}
