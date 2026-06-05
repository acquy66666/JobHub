"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface EmployerOption {
  id: string;
  email: string;
  employer: { id: string; companyName: string; logoUrl: string | null } | null;
}

interface Props {
  value: string | null;
  onChange: (employerId: string | null, companyName: string | null) => void;
  placeholder?: string;
  allowClear?: boolean;
}

export function EmployerPicker({ value, onChange, placeholder = "Chọn công ty...", allowClear = true }: Props) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", "EMPLOYER", "picker"],
    queryFn: () =>
      api
        .get<{ users: EmployerOption[]; total: number }>("/admin/users", { params: { role: "EMPLOYER", limit: 50 } })
        .then((r) => r.data),
    staleTime: 60_000,
  });

  const employers = data?.users ?? [];

  const selected = useMemo(
    () => employers.find((u) => u.employer?.id === value) ?? null,
    [employers, value],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employers;
    return employers.filter((u) => {
      const name = u.employer?.companyName?.toLowerCase() ?? "";
      const email = u.email.toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [employers, search]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 bg-bg-2 border border-border-dark rounded-xl px-4 py-2.5 text-[13px] text-t0 hover:border-[rgba(124,58,237,.4)] transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left flex-1">
          {selected?.employer?.companyName ?? <span className="text-t2">{placeholder}</span>}
        </span>
        <span className="text-t2 text-[12px]">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-bg-2 border border-border-dark rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border-dark">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm công ty hoặc email..."
              className="w-full bg-bg-3 border border-border-dark rounded-lg px-3 py-2 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)]"
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto">
            {isLoading && <li className="px-4 py-3 text-[13px] text-t2">Đang tải...</li>}
            {!isLoading && filtered.length === 0 && (
              <li className="px-4 py-3 text-[13px] text-t2">Không tìm thấy</li>
            )}
            {filtered.map((u) => (
              <li
                key={u.id}
                role="option"
                aria-selected={u.employer?.id === value}
                onClick={() => {
                  if (u.employer) {
                    onChange(u.employer.id, u.employer.companyName);
                    setOpen(false);
                    setSearch("");
                  }
                }}
                className={`px-4 py-2 cursor-pointer hover:bg-bg-3 text-[13px] ${
                  u.employer?.id === value ? "bg-[rgba(124,58,237,.1)]" : ""
                }`}
              >
                <div className="font-medium text-t0">{u.employer?.companyName ?? u.email}</div>
                <div className="text-[11px] text-t2 truncate">{u.email}</div>
              </li>
            ))}
            {allowClear && selected && (
              <li
                onClick={() => {
                  onChange(null, null);
                  setOpen(false);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-bg-3 text-[12px] text-t2 border-t border-border-dark"
              >
                ✕ Bỏ chọn
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
