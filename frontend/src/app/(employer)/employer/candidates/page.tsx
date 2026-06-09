"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import api from "@/lib/api";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { MonoNumber } from "@/components/ui/MonoNumber";

interface CandidateResult {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  headline: string | null;
  location: string | null;
  skills: string[];
  experienceCount: number;
}

interface SearchResult {
  candidates: CandidateResult[];
  total: number;
  page: number;
  totalPages: number;
}

export default function CandidatesPage() {
  const [skillInput, setSkillInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [activeParams, setActiveParams] = useState<{ skill?: string; location?: string; page: number } | null>(
    null,
  );

  const { data, isLoading } = useQuery<SearchResult>({
    queryKey: queryKeys.candidateSearch(activeParams ?? undefined),
    queryFn: () =>
      api
        .get("/employer/candidates/search", {
          params: {
            skill: activeParams?.skill,
            location: activeParams?.location,
            page: activeParams?.page ?? 1,
          },
        })
        .then((r) => r.data),
    enabled: activeParams !== null,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setActiveParams({
      skill: skillInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      page: 1,
    });
  }

  function handleClear() {
    setSkillInput("");
    setLocationInput("");
    setActiveParams(null);
  }

  const hasSearched = activeParams !== null;
  const candidates = data?.candidates ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const page = activeParams?.page ?? 1;

  return (
    <div className="pb-10">
      <section className="px-4 md:px-6 py-8">
        <h1 className="text-[clamp(26px,3.5vw,36px)] font-medium tracking-tight text-[var(--t0)]">
          Tìm ứng viên
        </h1>
        <p className="font-mono text-[13px] text-[var(--t1)] mt-2">
          {hasSearched ? `> ${total} kết quả · trang ${page}/${totalPages}` : "> tìm theo kỹ năng và địa điểm"}
        </p>
      </section>

      <form
        onSubmit={handleSearch}
        className="px-4 md:px-6 py-4 border-y border-[var(--border)] flex flex-wrap gap-3 items-center font-mono text-[13px]"
      >
        <span className="text-[var(--accent)]">{">"}</span>
        <input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          placeholder="kỹ năng (vd: react, python)"
          className="flex-1 min-w-[180px] bg-transparent border-b border-[var(--border)] px-1 py-1 text-[var(--t0)] placeholder:text-[var(--t2)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        <input
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder="địa điểm"
          className="flex-1 min-w-[140px] bg-transparent border-b border-[var(--border)] px-1 py-1 text-[var(--t0)] placeholder:text-[var(--t2)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        <button
          type="submit"
          className="px-3 py-1.5 border border-[var(--accent)] text-[var(--accent)] rounded-sharp hover:bg-[var(--accent-dim)] transition-colors"
        >
          tìm
        </button>
        {hasSearched && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[var(--t2)] hover:text-[var(--t0)] transition-colors"
          >
            xoá
          </button>
        )}
      </form>

      <p className="px-4 md:px-6 py-3 font-mono text-[12px] text-[var(--t2)]">
        🔒 email và số điện thoại ứng viên được ẩn để bảo vệ quyền riêng tư.
      </p>

      <HairlineSection label="KẾT QUẢ">
        {!hasSearched ? (
          <p className="px-4 md:px-6 py-10 font-mono text-[13px] text-[var(--t2)] text-center">
            Nhập kỹ năng hoặc địa điểm để bắt đầu.
          </p>
        ) : isLoading ? (
          <p className="px-4 md:px-6 py-8 font-mono text-[13px] text-[var(--t2)]">đang tải…</p>
        ) : candidates.length === 0 ? (
          <p className="px-4 md:px-6 py-10 font-mono text-[13px] text-[var(--t2)] text-center">
            Không tìm thấy ứng viên phù hợp.
          </p>
        ) : (
          candidates.map((c, i) => {
            const idx = String((page - 1) * 20 + i + 1).padStart(2, "0");
            const visibleSkills = c.skills.slice(0, 4);
            const extra = c.skills.length - 4;
            return (
              <div
                key={c.id}
                className="group grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_auto] items-center gap-4 px-4 md:px-6 min-h-[var(--row-h)] border-b border-[var(--border)] hover:bg-[var(--accent-dim)] transition-colors"
              >
                <MonoNumber size="lg" tone="muted">
                  {idx}
                </MonoNumber>
                <div className="min-w-0">
                  <div className="text-[15px] md:text-[17px] font-semibold text-[var(--t0)] truncate">
                    {c.fullName}
                  </div>
                  <div className="font-mono text-[12px] text-[var(--t1)] truncate mt-0.5">
                    {c.headline ? `${c.headline} · ` : ""}
                    {c.location ? `${c.location} · ` : ""}
                    {c.experienceCount > 0 ? `${c.experienceCount} kinh nghiệm` : "chưa có kinh nghiệm"}
                  </div>
                  {c.skills.length > 0 && (
                    <div className="font-mono text-[12px] text-[var(--accent)] truncate mt-0.5">
                      ✓ {visibleSkills.join(", ")}
                      {extra > 0 && <span className="text-[var(--t2)]"> +{extra}</span>}
                    </div>
                  )}
                </div>
                <span className="font-mono text-[12px] text-[var(--t2)]">→</span>
              </div>
            );
          })
        )}
      </HairlineSection>

      {hasSearched && totalPages > 1 && (
        <div className="px-4 md:px-6 py-6 flex items-center justify-between font-mono text-[13px] border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() =>
              setActiveParams((prev) => (prev ? { ...prev, page: Math.max(1, prev.page - 1) } : prev))
            }
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 text-[var(--t1)] hover:text-[var(--t0)] disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> prev
          </button>
          <span className="text-[var(--t2)] tabular-nums">
            page {page}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setActiveParams((prev) =>
                prev ? { ...prev, page: Math.min(totalPages, prev.page + 1) } : prev,
              )
            }
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 text-[var(--t1)] hover:text-[var(--t0)] disabled:opacity-30"
          >
            next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
