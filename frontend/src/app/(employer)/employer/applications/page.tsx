"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { MonoNumber } from "@/components/ui/MonoNumber";

type Status = "PENDING" | "REVIEWING" | "ACCEPTED" | "REJECTED";
type Tag = "SHORTLISTED" | "POTENTIAL" | "ON_HOLD";

interface AppItem {
  id: string;
  status: Status;
  tag: Tag | null;
  appliedAt: string;
  cvUrl: string;
  coverLetter: string | null;
  candidate: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    headline: string | null;
    location: string | null;
    user: { email: string };
  };
  job: { id: string; title: string };
  interviews?: { id: string; scheduledAt: string; status: string }[];
}

interface ListResp {
  applications: AppItem[];
  total: number;
  page: number;
  totalPages: number;
  jobOptions: { id: string; title: string }[];
  summary: { total: number; PENDING: number; REVIEWING: number; ACCEPTED: number; REJECTED: number };
}

const STATUS_LABEL: Record<Status, string> = {
  PENDING: "Chờ duyệt",
  REVIEWING: "Đang xem xét",
  ACCEPTED: "Trúng tuyển",
  REJECTED: "Từ chối",
};
const STATUS_COLOR: Record<Status, string> = {
  PENDING: "text-[#FCD34D] border-[rgba(245,158,11,.4)]",
  REVIEWING: "text-[#60A5FA] border-[rgba(59,130,246,.4)]",
  ACCEPTED: "text-[#4ADE80] border-[rgba(34,197,94,.4)]",
  REJECTED: "text-[#F87171] border-[rgba(239,68,68,.4)]",
};
const TAG_LABEL: Record<Tag, string> = {
  SHORTLISTED: "⭐ Shortlist",
  POTENTIAL: "💡 Tiềm năng",
  ON_HOLD: "⏸ Tạm giữ",
};

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "", label: "tất cả" },
  { value: "PENDING", label: "chờ duyệt" },
  { value: "REVIEWING", label: "đang xem" },
  { value: "ACCEPTED", label: "trúng tuyển" },
  { value: "REJECTED", label: "từ chối" },
];

function fmtDate(s: string) {
  const d = new Date(s);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
}

export default function AllApplicationsPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ jobId: "", status: "", tag: "", keyword: "" });
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedKeyword(filters.keyword.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [filters.keyword]);

  const { data, isLoading } = useQuery<ListResp>({
    queryKey: ["employer-all-applications", filters.jobId, filters.status, filters.tag, debouncedKeyword, page],
    queryFn: () =>
      api
        .get("/employer/applications", {
          params: {
            jobId: filters.jobId || undefined,
            status: filters.status || undefined,
            tag: filters.tag || undefined,
            keyword: debouncedKeyword || undefined,
            page,
            limit: 20,
          },
        })
        .then((r) => r.data),
    staleTime: 30_000,
  });

  const statusMut = useMutation({
    mutationFn: ({ jobId, appId, status }: { jobId: string; appId: string; status: Status }) =>
      api.patch(`/employer/jobs/${jobId}/applications/${appId}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employer-all-applications"] }),
  });
  const tagMut = useMutation({
    mutationFn: ({ jobId, appId, tag }: { jobId: string; appId: string; tag: Tag | null }) =>
      api.patch(`/employer/jobs/${jobId}/applications/${appId}/tag`, { tag }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employer-all-applications"] }),
  });

  const apps = data?.applications ?? [];
  const summary = data?.summary;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div data-testid="all-applications-page" className="pb-10">
      <section className="px-4 md:px-6 py-8">
        <h1 className="text-[clamp(26px,3.5vw,36px)] font-medium tracking-tight text-[var(--t0)]">Ứng viên</h1>
        <p className="font-mono text-[13px] text-[var(--t1)] mt-2">
          {`> ${summary?.total ?? 0} đơn · trang ${page}/${totalPages}`}
        </p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-5 border-t border-[var(--border)]">
        {[
          { label: "tổng", value: summary?.total, tone: "default" as const },
          { label: "chờ duyệt", value: summary?.PENDING, tone: "default" as const },
          { label: "đang xem", value: summary?.REVIEWING, tone: "default" as const },
          { label: "trúng tuyển", value: summary?.ACCEPTED, tone: "success" as const },
          { label: "từ chối", value: summary?.REJECTED, tone: "danger" as const },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`px-4 md:px-6 py-4 border-[var(--border)] ${i < 4 ? "border-r" : ""} ${
              i < 3 ? "border-b md:border-b-0" : ""
            }`}
          >
            <MonoNumber size="lg" tone={s.tone}>
              {s.value ?? 0}
            </MonoNumber>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--t2)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="px-4 md:px-6 py-4 border-t border-[var(--border)] flex flex-wrap items-center gap-3 font-mono text-[12px]">
        {STATUS_TABS.map((tab) => {
          const active = filters.status === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setFilters((f) => ({ ...f, status: tab.value }));
                setPage(1);
              }}
              className={`transition-colors ${
                active ? "text-[var(--accent)]" : "text-[var(--t2)] hover:text-[var(--t0)]"
              }`}
            >
              {active ? `[${tab.label}]` : tab.label}
            </button>
          );
        })}
        <span className="text-[var(--t2)] mx-1">·</span>
        <select
          value={filters.jobId}
          onChange={(e) => {
            setFilters((f) => ({ ...f, jobId: e.target.value }));
            setPage(1);
          }}
          className="bg-transparent border border-[var(--border)] rounded-sharp px-2 py-1 text-[12px] text-[var(--t1)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="" className="bg-[var(--bg-2)]">
            mọi tin
          </option>
          {(data?.jobOptions ?? []).map((j) => (
            <option key={j.id} value={j.id} className="bg-[var(--bg-2)]">
              {j.title}
            </option>
          ))}
        </select>
        <input
          value={filters.keyword}
          onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
          placeholder="tìm tên / email…"
          className="bg-transparent border border-[var(--border)] rounded-sharp px-2 py-1 text-[12px] text-[var(--t0)] placeholder:text-[var(--t2)] focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      <HairlineSection label="DANH SÁCH">
        {isLoading ? (
          <p className="px-4 md:px-6 py-8 font-mono text-[13px] text-[var(--t2)]">đang tải…</p>
        ) : apps.length === 0 ? (
          <p className="px-4 md:px-6 py-10 font-mono text-[13px] text-[var(--t2)] text-center">
            Chưa có đơn nào.
          </p>
        ) : (
          apps.map((app, i) => {
            const expanded = expandedId === app.id;
            const idx = String((page - 1) * 20 + i + 1).padStart(2, "0");
            return (
              <div
                key={app.id}
                data-testid="app-row"
                className={`border-b border-[var(--border)] border-l-2 ${
                  expanded ? "border-l-[var(--accent)] bg-[var(--accent-dim)]" : "border-l-transparent"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : app.id)}
                  aria-expanded={expanded}
                  className="w-full grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_auto] items-center gap-4 px-4 md:px-6 min-h-[var(--row-h)] text-left hover:bg-[var(--accent-dim)] transition-colors"
                >
                  <MonoNumber size="lg" tone="muted">
                    {idx}
                  </MonoNumber>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[15px] md:text-[17px] font-semibold text-[var(--t0)] truncate">
                        {app.candidate.fullName}
                      </span>
                      {app.tag && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sharp border border-[var(--accent)] text-[var(--accent)]">
                          {TAG_LABEL[app.tag]}
                        </span>
                      )}
                      {app.interviews && app.interviews.length > 0 && (
                        <span className="text-[10px] font-mono uppercase text-[var(--accent)]">PV</span>
                      )}
                    </div>
                    <div className="font-mono text-[12px] text-[var(--t1)] truncate mt-0.5">
                      {app.job.title} · {fmtDate(app.appliedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={app.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono text-[12px] text-[var(--accent)] hover:underline hidden sm:inline"
                    >
                      📄 CV
                    </a>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-sharp border ${STATUS_COLOR[app.status]}`}>
                      {STATUS_LABEL[app.status]}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--t2)] transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 md:px-6 pb-5 pt-3 border-t border-[var(--border)] space-y-4 font-mono text-[12px]">
                    <p className="text-[var(--t2)]">{app.candidate.user.email}</p>
                    {app.candidate.headline && (
                      <p className="text-[var(--t1)]">{app.candidate.headline}</p>
                    )}
                    {app.candidate.location && (
                      <p className="text-[var(--t1)]">📍 {app.candidate.location}</p>
                    )}
                    {app.coverLetter && (
                      <div>
                        <p className="uppercase tracking-wider text-[var(--t2)] mb-1.5">thư giới thiệu</p>
                        <p className="text-[13px] text-[var(--t1)] whitespace-pre-wrap leading-relaxed font-sans">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="uppercase tracking-wider text-[var(--t2)] mb-2">đổi trạng thái</p>
                      <div className="flex flex-wrap gap-2">
                        {(["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"] as Status[]).map((s) => (
                          <button
                            key={s}
                            disabled={statusMut.isPending || app.status === s}
                            onClick={() =>
                              statusMut.mutate({ jobId: app.job.id, appId: app.id, status: s })
                            }
                            className={`px-3 py-1.5 rounded-sharp border transition-colors disabled:opacity-40 ${STATUS_COLOR[s]} hover:bg-[var(--accent-dim)]`}
                          >
                            {STATUS_LABEL[s]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="uppercase tracking-wider text-[var(--t2)] mb-2">gắn tag</p>
                      <div className="flex flex-wrap gap-2">
                        {(["SHORTLISTED", "POTENTIAL", "ON_HOLD"] as Tag[]).map((t) => (
                          <button
                            key={t}
                            disabled={tagMut.isPending}
                            onClick={() =>
                              tagMut.mutate({
                                jobId: app.job.id,
                                appId: app.id,
                                tag: app.tag === t ? null : t,
                              })
                            }
                            className={`px-3 py-1.5 rounded-sharp border transition-colors disabled:opacity-40 ${
                              app.tag === t
                                ? "border-[var(--accent)] text-[var(--accent)]"
                                : "border-[var(--border)] text-[var(--t1)] hover:text-[var(--t0)]"
                            }`}
                          >
                            {TAG_LABEL[t]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--border)] flex flex-wrap gap-3">
                      <Link
                        href={`/employer/jobs/${app.job.id}/applications`}
                        className="text-[var(--accent)] hover:underline"
                      >
                        → xem trong tin tuyển dụng
                      </Link>
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="sm:hidden text-[var(--accent)] hover:underline"
                      >
                        → mở CV
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </HairlineSection>

      {totalPages > 1 && (
        <div className="px-4 md:px-6 py-6 flex items-center justify-between font-mono text-[13px] border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              setExpandedId(null);
            }}
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
            onClick={() => {
              setPage((p) => Math.min(totalPages, p + 1));
              setExpandedId(null);
            }}
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
