"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

interface RowProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  compact?: boolean;
  active?: boolean;
  className?: string;
  as?: "button" | "div" | "a";
  href?: string;
}

export function Row({
  children,
  compact = false,
  active = false,
  className = "",
  as = "button",
  href,
  ...rest
}: RowProps) {
  const base = `group grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_auto] items-center gap-4 px-4 md:px-6 w-full text-left border-b border-[var(--border)] transition-colors duration-100 hover:bg-[var(--accent-dim)] focus-visible:outline-none focus-visible:bg-[var(--accent-dim)] ${
    compact ? "min-h-[var(--row-h-compact)]" : "min-h-[var(--row-h)]"
  } ${active ? "bg-[var(--accent-dim)] border-l-2 border-l-[var(--accent)]" : "border-l-2 border-l-transparent"} ${className}`;

  if (as === "a" && href) {
    return (
      <a href={href} className={base}>
        {children}
      </a>
    );
  }
  if (as === "div") {
    return <div className={base}>{children}</div>;
  }
  return (
    <button type="button" className={base} {...rest}>
      {children}
    </button>
  );
}

Row.Lead = function RowLead({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-start ${className}`}>{children}</div>
  );
};

Row.Body = function RowBody({
  title,
  meta,
  className = "",
}: {
  title: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="text-[15px] md:text-[17px] font-semibold text-[var(--t0)] truncate group-hover:text-[var(--accent)] transition-colors duration-100">
        {title}
      </div>
      {meta && (
        <div className="text-[13px] text-[var(--t1)] truncate mt-0.5">{meta}</div>
      )}
    </div>
  );
};

Row.End = function RowEnd({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-end gap-0.5 shrink-0 ${className}`}>
      {children}
    </div>
  );
};
