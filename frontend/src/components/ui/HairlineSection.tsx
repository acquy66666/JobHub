import { ReactNode } from "react";
import { CapsLabel } from "./CapsLabel";

interface Props {
  label?: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  topRule?: boolean;
  bottomRule?: boolean;
}

export function HairlineSection({
  label,
  meta,
  children,
  className = "",
  topRule = true,
  bottomRule = false,
}: Props) {
  return (
    <section
      className={`${topRule ? "border-t" : ""} ${
        bottomRule ? "border-b" : ""
      } border-[var(--border)] ${className}`}
    >
      {(label || meta) && (
        <header className="flex items-baseline justify-between px-4 py-3 md:px-6 border-b border-[var(--border)]">
          {label && <CapsLabel tone="muted">{label}</CapsLabel>}
          {meta && <div className="text-[12px] text-[var(--t1)]">{meta}</div>}
        </header>
      )}
      <div>{children}</div>
    </section>
  );
}
