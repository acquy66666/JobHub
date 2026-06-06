"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { skillsApi, type Skill, type SkillCategory, CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/api/skills";

type Props = {
  value: string[];
  onChange: (slugs: string[]) => void;
  placeholder?: string;
  proposeBasePath?: string;
};

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default function SkillCombobox({ value, onChange, placeholder, proposeBasePath = "/candidate/skills/propose" }: Props) {
  const { data: grouped, isLoading } = useQuery({
    queryKey: ["skills", "by-category"],
    queryFn: () => skillsApi.listByCategory(),
    staleTime: 60 * 60 * 1000,
  });

  const allSkills = useMemo(() => {
    if (!grouped) return [] as Skill[];
    return CATEGORY_ORDER.flatMap((c) => grouped[c] ?? []);
  }, [grouped]);

  const bySlug = useMemo(() => new Map(allSkills.map((s) => [s.slug, s])), [allSkills]);

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
    if (!grouped) return {} as Record<SkillCategory, Skill[]>;
    if (!query.trim()) return grouped;
    const nq = normalize(query);
    const out = {} as Record<SkillCategory, Skill[]>;
    for (const cat of CATEGORY_ORDER) {
      const list = (grouped[cat] ?? []).filter((s) => {
        if (normalize(s.nameVi).includes(nq)) return true;
        if (s.nameEn && normalize(s.nameEn).includes(nq)) return true;
        if (s.slug.includes(nq)) return true;
        if (s.aliases.some((a) => normalize(a).includes(nq))) return true;
        return false;
      });
      if (list.length > 0) out[cat] = list;
    }
    return out;
  }, [grouped, query]);

  const totalFiltered = Object.values(filtered).reduce((n, list) => n + list.length, 0);

  function toggle(slug: string) {
    if (value.includes(slug)) onChange(value.filter((s) => s !== slug));
    else onChange([...value, slug]);
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
        {value.map((slug) => {
          const skill = bySlug.get(slug);
          const label = skill?.nameVi ?? slug;
          return (
            <span key={slug} className="inline-flex items-center gap-1 bg-[rgba(124,58,237,.12)] text-[#B09BF8] border border-[rgba(124,58,237,.2)] px-3 py-1 rounded-full text-[12px] font-medium">
              {label}
              <button type="button" onClick={() => toggle(slug)} aria-label={`Xoá ${label}`} className="ml-1 text-[#B09BF8]/60 hover:text-red-400">×</button>
            </span>
          );
        })}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? "Tìm kỹ năng (vd: React, Tiếng Anh, Kế toán)..."}
        className="w-full bg-[#13131E] border border-[#252538] rounded-xl px-4 py-2.5 text-[14px] text-[#F5F5FF] placeholder:text-[#55556A] focus:outline-none focus:border-[rgba(124,58,237,.5)] focus:ring-2 focus:ring-[rgba(124,58,237,.1)]"
      />

      {open && (
        <div className="absolute z-30 mt-2 w-full max-h-80 overflow-y-auto bg-[#0E0E18] border border-[#252538] rounded-xl shadow-2xl">
          {isLoading && <div className="p-4 text-[13px] text-[#9494B0]">Đang tải kỹ năng...</div>}
          {!isLoading && totalFiltered === 0 && (
            <div className="p-4 text-[13px] text-[#9494B0]">
              Không tìm thấy kỹ năng phù hợp{query.trim() ? <> với &quot;<span className="text-t0">{query.trim()}</span>&quot;</> : null}.
              <a
                href={`${proposeBasePath}${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(124,58,237,.12)] border border-[rgba(124,58,237,.3)] text-[#B09BF8] text-[12px] font-semibold hover:bg-[rgba(124,58,237,.18)]"
              >
                💡 Đề xuất kỹ năng mới →
              </a>
            </div>
          )}
          {!isLoading && CATEGORY_ORDER.map((cat) => {
            const list = filtered[cat];
            if (!list || list.length === 0) return null;
            return (
              <div key={cat}>
                <div className="px-3 py-1.5 bg-[#13131E] text-[11px] font-semibold uppercase tracking-wider text-[#B09BF8] border-b border-[#252538] sticky top-0">
                  {CATEGORY_LABEL[cat]} · {list.length}
                </div>
                <ul>
                  {list.map((s) => {
                    const selected = value.includes(s.slug);
                    return (
                      <li key={s.slug}>
                        <button
                          type="button"
                          onClick={() => toggle(s.slug)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between text-[13px] hover:bg-[#1A1A28] transition ${selected ? "bg-[rgba(124,58,237,.08)]" : ""}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded border flex items-center justify-center ${selected ? "bg-[#7C3AED] border-[#7C3AED]" : "border-[#252538]"}`}>
                              {selected && <span className="text-white text-[10px]">✓</span>}
                            </span>
                            <span className="text-[#F5F5FF]">{s.nameVi}</span>
                            {s.nameEn && s.nameEn !== s.nameVi && (
                              <span className="text-[#55556A] text-[11px]">· {s.nameEn}</span>
                            )}
                          </span>
                          {s.jobCount > 0 && (
                            <span className="text-[10px] text-[#4ADE80] bg-[rgba(34,197,94,.08)] border border-[rgba(34,197,94,.2)] rounded px-1.5 py-0.5">
                              {s.jobCount} tin
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
