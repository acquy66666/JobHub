"use client";

import Link from "next/link";

export interface Tab {
  href: string;
  label: string;
  count?: number;
}

interface Props {
  tabs: Tab[];
  activeHref: string;
  className?: string;
}

export function TabBar({ tabs, activeHref, className = "" }: Props) {
  return (
    <nav
      className={`flex items-center gap-0 overflow-x-auto border-b border-[var(--border)] ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.href === activeHref;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={`relative inline-flex items-center gap-2 px-4 md:px-5 py-3 text-[14px] font-medium whitespace-nowrap transition-colors duration-100 ${
              isActive
                ? "text-[var(--t0)]"
                : "text-[var(--t1)] hover:text-[var(--t0)]"
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span className="font-mono tabular-nums text-[12px] text-[var(--t2)]">
                {tab.count}
              </span>
            )}
            {isActive && (
              <span
                aria-hidden
                className="absolute left-3 right-3 -bottom-px h-[2px] bg-[var(--accent)]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
