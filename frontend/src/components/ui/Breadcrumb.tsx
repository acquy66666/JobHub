import Link from "next/link";
import { Fragment } from "react";

export interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: Props) {
  return (
    <nav
      aria-label="breadcrumb"
      className={`flex items-center gap-2 text-[13px] text-[var(--t1)] font-mono ${className}`}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={i}>
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[var(--t0)] transition-colors duration-100"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-[var(--t0)]" : ""}>{item.label}</span>
            )}
            {!isLast && <span aria-hidden className="text-[var(--t2)]">/</span>}
          </Fragment>
        );
      })}
    </nav>
  );
}
