"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import api from "@/lib/api";

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

function CandidateCard({ candidate, index }: { candidate: CandidateResult; index: number }) {
  const initial = candidate.fullName?.[0]?.toUpperCase() ?? "?";
  const visibleSkills = candidate.skills.slice(0, 3);
  const extraSkills = candidate.skills.length - 3;

  return (
    <ScrollReveal direction="up" delay={index * 0.05}>
      <div className="card-dark p-5 rounded-2xl hover:border-[rgba(124,58,237,.38)] hover:-translate-y-[2px] hover:shadow-[0_14px_48px_rgba(0,0,0,.3)] transition-all duration-200">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-bg-3 flex items-center justify-center">
            {candidate.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[17px] font-black gradient-text">{initial}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-t0 truncate">{candidate.fullName}</p>
            {candidate.headline && (
              <p className="text-[12px] text-t1 mt-0.5 truncate">{candidate.headline}</p>
            )}
          </div>
        </div>

        {/* Location */}
        {candidate.location && (
          <p className="text-[12px] text-t2 flex items-center gap-1 mb-3">
            <span>📍</span> {candidate.location}
          </p>
        )}

        {/* Skills */}
        {candidate.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {visibleSkills.map(s => (
              <span key={s} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[rgba(124,58,237,.1)] text-[#B09BF8] border border-[rgba(124,58,237,.2)]">
                {s}
              </span>
            ))}
            {extraSkills > 0 && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-bg-3 text-t2 border border-border-dark">
                +{extraSkills}
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-t2 mb-3">Chưa cập nhật kỹ năng</p>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border-dark/50">
          <span className="text-[11px] text-t2">
            💼 {candidate.experienceCount > 0 ? `${candidate.experienceCount} kinh nghiệm` : "Chưa có kinh nghiệm"}
          </span>
        </div>
      </div>
    </ScrollReveal>
  );
}

function SkeletonCard() {
  return (
    <div className="card-dark p-5 rounded-2xl animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-bg-3 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-bg-3 rounded w-3/4" />
          <div className="h-3 bg-bg-3 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-bg-3 rounded w-1/3 mb-3" />
      <div className="flex gap-1.5 mb-3">
        {[60, 80, 50].map(w => <div key={w} className="h-5 bg-bg-3 rounded-md" style={{ width: w }} />)}
      </div>
      <div className="pt-3 border-t border-border-dark/50">
        <div className="h-3 bg-bg-3 rounded w-1/4" />
      </div>
    </div>
  );
}

export default function CandidatesPage() {
  const [skillInput, setSkillInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [activeParams, setActiveParams] = useState<{ skill?: string; location?: string; page: number } | null>(null);

  const { data, isLoading } = useQuery<SearchResult>({
    queryKey: queryKeys.candidateSearch(activeParams ?? undefined),
    queryFn: () =>
      api.get("/employer/candidates/search", {
        params: { skill: activeParams?.skill, location: activeParams?.location, page: activeParams?.page ?? 1 },
      }).then(r => r.data),
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

  function handlePageChange(page: number) {
    setActiveParams(prev => prev ? { ...prev, page } : { page });
  }

  const hasSearched = activeParams !== null;
  const candidates = data?.candidates ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <ScrollReveal direction="up" className="mb-6">
        <h1 className="text-[28px] font-extrabold text-t0 tracking-tight">Tìm kiếm ứng viên</h1>
        <p className="text-[14px] text-t1 mt-1">Tìm ứng viên phù hợp theo kỹ năng và địa điểm.</p>
      </ScrollReveal>

      {/* Search form */}
      <ScrollReveal direction="up" delay={0.05}>
        <form onSubmit={handleSearch} className="card-dark p-5 rounded-2xl mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-t2 uppercase tracking-wider mb-1.5 block">Kỹ năng</label>
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                placeholder="VD: React, Python, Figma..."
                className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2.5 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] focus:ring-1 focus:ring-[rgba(124,58,237,.2)] transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-t2 uppercase tracking-wider mb-1.5 block">Địa điểm</label>
              <input
                value={locationInput}
                onChange={e => setLocationInput(e.target.value)}
                placeholder="VD: Hà Nội, TP. HCM..."
                className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2.5 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] focus:ring-1 focus:ring-[rgba(124,58,237,.2)] transition-colors"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="btn-primary px-6 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap"
              >
                Tìm kiếm
              </button>
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2.5 rounded-xl text-[13px] text-t1 border border-border-dark hover:text-t0 hover:border-[rgba(124,58,237,.3)] transition-colors whitespace-nowrap"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </form>
      </ScrollReveal>

      {/* Privacy notice */}
      <ScrollReveal direction="up" delay={0.08}>
        <div className="flex items-center gap-2 text-[12px] text-t2 mb-6 px-1">
          <span>🔒</span>
          <span>Email và số điện thoại ứng viên được ẩn để bảo vệ quyền riêng tư.</span>
        </div>
      </ScrollReveal>

      {/* Results */}
      {!hasSearched ? (
        <ScrollReveal direction="up" delay={0.1}>
          <div className="card-dark rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-[18px] font-bold text-t0 mb-2">Tìm kiếm ứng viên</h3>
            <p className="text-[14px] text-t1">Nhập kỹ năng hoặc địa điểm để bắt đầu tìm kiếm.</p>
          </div>
        </ScrollReveal>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : candidates.length === 0 ? (
        <ScrollReveal direction="up">
          <div className="card-dark rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">😔</div>
            <h3 className="text-[18px] font-bold text-t0 mb-2">Không tìm thấy ứng viên</h3>
            <p className="text-[14px] text-t1 mb-4">Thử thay đổi kỹ năng hoặc địa điểm tìm kiếm.</p>
            <button onClick={handleClear} className="text-[13px] text-primary hover:underline">
              Xóa bộ lọc
            </button>
          </div>
        </ScrollReveal>
      ) : (
        <>
          <ScrollReveal direction="up" delay={0.05}>
            <p className="text-[13px] text-t2 mb-4">Tìm thấy <span className="text-t0 font-semibold">{total}</span> ứng viên</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((c, i) => (
              <CandidateCard key={c.id} candidate={c} index={i} />
            ))}
          </div>
          <Pagination
            page={activeParams?.page ?? 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
