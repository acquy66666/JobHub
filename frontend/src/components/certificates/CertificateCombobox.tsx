"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  certificatesApi,
  CERT_CATEGORY_LABEL,
  CERT_CATEGORY_ORDER,
  type Certificate,
  type CertificateCategory,
} from "@/lib/api/certificates";

type Props = {
  value: string | null;
  onChange: (slug: string | null) => void;
  placeholder?: string;
};

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default function CertificateCombobox({ value, onChange, placeholder = "Tìm chứng chỉ..." }: Props) {
  const { data: grouped, isLoading } = useQuery({
    queryKey: ["certificates", "by-category"],
    queryFn: () => certificatesApi.listByCategory(),
    staleTime: 60 * 60 * 1000,
  });

  const allCerts = useMemo(() => {
    if (!grouped) return [] as Certificate[];
    return CERT_CATEGORY_ORDER.flatMap((c) => grouped[c] ?? []);
  }, [grouped]);

  const bySlug = useMemo(() => new Map(allCerts.map((c) => [c.slug, c])), [allCerts]);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    if (!grouped) return {} as Record<CertificateCategory, Certificate[]>;
    if (!query.trim()) return grouped;
    const nq = normalize(query);
    const out = {} as Record<CertificateCategory, Certificate[]>;
    for (const cat of CERT_CATEGORY_ORDER) {
      const list = (grouped[cat] ?? []).filter((c) => {
        if (normalize(c.nameVi).includes(nq)) return true;
        if (c.nameEn && normalize(c.nameEn).includes(nq)) return true;
        if (normalize(c.issuer).includes(nq)) return true;
        if (c.slug.includes(nq)) return true;
        return false;
      });
      if (list.length > 0) out[cat] = list;
    }
    return out;
  }, [grouped, query]);

  const selected = value ? bySlug.get(value) ?? null : null;

  return (
    <div ref={wrapRef} className="relative" data-testid="cert-combobox">
      <div
        className="flex items-center gap-2 px-3 py-2 bg-bg-3 border border-border-dark rounded-xl cursor-text focus-within:border-purple-500/50"
        onClick={() => setOpen(true)}
      >
        {selected ? (
          <span className="flex-1 text-[14px] text-t0">
            <span className="font-semibold">{selected.nameVi}</span>
            <span className="ml-2 text-[12px] text-t2">· {selected.issuer}</span>
          </span>
        ) : (
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-[14px] text-t0 placeholder:text-t2"
          />
        )}
        {selected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
              setQuery("");
            }}
            className="text-t2 hover:text-red-400 text-sm"
            aria-label="Xoá lựa chọn"
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-2 max-h-[360px] overflow-y-auto bg-bg-2 border border-border-dark rounded-xl shadow-xl">
          {isLoading ? (
            <div className="p-4 text-[13px] text-t2">Đang tải...</div>
          ) : Object.keys(filtered).length === 0 ? (
            <div className="p-4 text-[13px] text-t2">Không tìm thấy chứng chỉ phù hợp.</div>
          ) : (
            CERT_CATEGORY_ORDER.map((cat) => {
              const list = filtered[cat];
              if (!list || list.length === 0) return null;
              return (
                <div key={cat} className="border-b border-border-dark last:border-0">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-t2 bg-bg-1">
                    {CERT_CATEGORY_LABEL[cat]}
                  </div>
                  {list.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => {
                        onChange(c.slug);
                        setQuery("");
                        setOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[13px] hover:bg-bg-3 flex items-baseline gap-2"
                    >
                      <span className="font-semibold text-t0">{c.nameVi}</span>
                      <span className="text-[11px] text-t2">{c.issuer}</span>
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
