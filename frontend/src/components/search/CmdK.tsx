"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { parseQuery, chipsFor, type ParsedQuery } from "./cmdk-parser";

interface Suggestion {
  key: string;
  label: string;
  hint?: string;
}

interface Props {
  placeholder?: string;
  defaultValue?: string;
  onSubmit?: (raw: string, parsed: ParsedQuery) => void;
  onChange?: (raw: string, parsed: ParsedQuery) => void;
  className?: string;
  size?: "lg" | "md";
  suggestionGroups?: { label: string; items: Suggestion[] }[];
  autoFocus?: boolean;
}

const DEFAULT_HINTS: { label: string; items: Suggestion[] }[] = [
  {
    label: "VÍ DỤ",
    items: [
      { key: "ex1", label: "react remote 20m hà nội", hint: "skill + mode + lương + location" },
      { key: "ex2", label: "fullstack hybrid 15-25 tphcm", hint: "tự do gõ — parser tự nhận" },
      { key: "ex3", label: "match>80 python", hint: "chỉ xem job match cao" },
    ],
  },
];

export function CmdK({
  placeholder = "Thử \"react remote 20m hà nội\"",
  defaultValue = "",
  onSubmit,
  onChange,
  className = "",
  size = "lg",
  suggestionGroups = DEFAULT_HINTS,
  autoFocus = false,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const parsed = parseQuery(value);
  const chips = chipsFor(parsed);

  useEffect(() => {
    onChange?.(value, parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.(value, parsed);
  }

  const showSuggestions = focused && !value;
  const sizeClass = size === "lg" ? "h-14 text-[16px]" : "h-11 text-[14px]";

  return (
    <div className={`relative ${className}`}>
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-3 px-4 border border-[var(--border)] bg-[var(--bg-1)] rounded-sharp transition-colors duration-100 focus-within:border-[var(--accent)] ${sizeClass}`}
      >
        <Search size={size === "lg" ? 18 : 16} className="text-[var(--t2)] shrink-0" />
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-[var(--t0)] placeholder:text-[var(--t2)] font-mono text-[14px] md:text-[15px]"
          aria-label="Tìm kiếm việc làm"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            aria-label="Xóa"
            className="shrink-0 text-[var(--t2)] hover:text-[var(--t0)] transition-colors"
          >
            <X size={16} />
          </button>
        )}
        <kbd className="hidden md:inline-flex items-center px-1.5 h-5 text-[10px] font-mono text-[var(--t2)] border border-[var(--border)] rounded-sharp">
          ↵
        </kbd>
      </form>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {chips.map((c) => (
            <span
              key={c.key}
              className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono uppercase tracking-wide rounded-sharp border ${
                c.tone === "filter"
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-dim)]"
                  : "border-[var(--border)] text-[var(--t1)]"
              }`}
            >
              {c.label}
            </span>
          ))}
        </div>
      )}

      {showSuggestions && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-30 border border-[var(--border)] bg-[var(--bg-1)] rounded-sharp shadow-none"
        >
          {suggestionGroups.map((g) => (
            <div key={g.label}>
              <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--t2)] border-b border-[var(--border)]">
                {g.label}
              </div>
              <ul>
                {g.items.map((it) => (
                  <li key={it.key}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setValue(it.label);
                        inputRef.current?.focus();
                      }}
                      className="w-full text-left flex items-baseline justify-between gap-4 px-4 py-2.5 hover:bg-[var(--accent-dim)] transition-colors duration-100"
                    >
                      <span className="font-mono text-[13px] text-[var(--t0)]">
                        {it.label}
                      </span>
                      {it.hint && (
                        <span className="text-[11px] text-[var(--t2)] shrink-0">
                          {it.hint}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
