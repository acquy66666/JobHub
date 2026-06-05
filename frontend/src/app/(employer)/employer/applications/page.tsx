"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import api from "@/lib/api";

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
  PENDING: "bg-[rgba(245,158,11,.12)] text-[#FCD34D] border-[rgba(245,158,11,.25)]",
  REVIEWING: "bg-[rgba(59,130,246,.12)] text-[#60A5FA] border-[rgba(59,130,246,.25)]",
  ACCEPTED: "bg-[rgba(34,197,94,.12)] text-[#4ADE80] border-[rgba(34,197,94,.25)]",
  REJECTED: "bg-[rgba(239,68,68,.12)] text-[#F87171] border-[rgba(239,68,68,.25)]",
};
const TAG_LABEL: Record<Tag, string> = {
  SHORTLISTED: "⭐ Shortlist",
  POTENTIAL: "💡 Tiềm năng",
  ON_HOLD: "⏸ Tạm giữ",
};

function fmtDate(s: string) {
  const d = new Date(s);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
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
      api.get("/employer/applications", {
        params: {
          jobId: filters.jobId || undefined,
          status: filters.status || undefined,
          tag: filters.tag || undefined,
          keyword: debouncedKeyword || undefined,
          page,
          limit: 20,
        },
      }).then((r) => r.data),
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

  function resetFilters() {
    setFilters({ jobId: "", status: "", tag: "", keyword: "" });
    setDebouncedKeyword("");
    setPage(1);
  }

  return (
    <div data-testid="all-applications-page" className="p-4 sm:p-8 max-w-6xl">
      <ScrollReveal direction="up" className="mb-6">
        <h1 className="text-[26px] sm:text-[28px] font-extrabold text-t0 tracking-tight">Quản lý ứng viên</h1>
        <p className="text-[13px] sm:text-[14px] text-t1 mt-1">Tổng hợp toàn bộ đơn ứng tuyển từ mọi tin của bạn.</p>
      </ScrollReveal>

      {/* Stat row */}
      <ScrollReveal direction="up" delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-5">
          <StatCard label="Tổng đơn" value={summary?.total ?? 0} color="text-t0" />
          <StatCard label="Chờ duyệt" value={summary?.PENDING ?? 0} color="text-[#FCD34D]" />
          <StatCard label="Đang xem" value={summary?.REVIEWING ?? 0} color="text-[#60A5FA]" />
          <StatCard label="Trúng tuyển" value={summary?.ACCEPTED ?? 0} color="text-[#4ADE80]" />
          <StatCard label="Từ chối" value={summary?.REJECTED ?? 0} color="text-[#F87171]" />
        </div>
      </ScrollReveal>

      {/* Filter bar */}
      <ScrollReveal direction="up" delay={0.08}>
        <div className="card-dark p-4 rounded-2xl mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-t2 uppercase tracking-wider mb-1.5 block">Tin tuyển dụng</label>
              <select
                value={filters.jobId}
                onChange={(e) => { setFilters((f) => ({ ...f, jobId: e.target.value })); setPage(1); }}
                className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2.5 text-[13px] text-t0 focus:outline-none focus:border-[rgba(124,58,237,.5)]"
              >
                <option value="">Tất cả tin</option>
                {(data?.jobOptions ?? []).map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-t2 uppercase tracking-wider mb-1.5 block">Trạng thái</label>
              <select
                value={filters.status}
                onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }}
                className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2.5 text-[13px] text-t0 focus:outline-none focus:border-[rgba(124,58,237,.5)]"
              >
                <option value="">Tất cả</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="REVIEWING">Đang xem xét</option>
                <option value="ACCEPTED">Trúng tuyển</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-t2 uppercase tracking-wider mb-1.5 block">Tag</label>
              <select
                value={filters.tag}
                onChange={(e) => { setFilters((f) => ({ ...f, tag: e.target.value })); setPage(1); }}
                className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2.5 text-[13px] text-t0 focus:outline-none focus:border-[rgba(124,58,237,.5)]"
              >
                <option value="">Tất cả tag</option>
                <option value="SHORTLISTED">⭐ Shortlist</option>
                <option value="POTENTIAL">💡 Tiềm năng</option>
                <option value="ON_HOLD">⏸ Tạm giữ</option>
                <option value="NONE">Chưa gắn tag</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-t2 uppercase tracking-wider mb-1.5 block">Tìm theo tên / email</label>
              <input
                value={filters.keyword}
                onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
                placeholder="Nguyễn, @gmail.com..."
                className="w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2.5 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)]"
              />
            </div>
          </div>
          {(filters.jobId || filters.status || filters.tag || filters.keyword) && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 text-[12px] text-t1 hover:text-t0 underline underline-offset-2"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </ScrollReveal>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[72px] rounded-xl bg-bg-2 animate-pulse" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <ScrollReveal direction="up">
          <div className="card-dark rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-[18px] font-bold text-t0 mb-2">Chưa có đơn nào</h3>
            <p className="text-[14px] text-t1">Khi có ứng viên nộp đơn, đơn sẽ xuất hiện ở đây.</p>
          </div>
        </ScrollReveal>
      ) : (
        <div className="space-y-2">
          {apps.map((app, i) => {
            const expanded = expandedId === app.id;
            const initial = app.candidate.fullName?.[0]?.toUpperCase() ?? "?";
            return (
              <ScrollReveal key={app.id} direction="up" delay={Math.min(i, 8) * 0.03}>
                <div data-testid="app-row" className="card-dark rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : app.id)}
                    className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left hover:bg-white/[.02] transition-colors"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-bg-3 flex items-center justify-center">
                      {app.candidate.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={app.candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[14px] font-black gradient-text">{initial}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-bold text-t0 truncate">{app.candidate.fullName}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${STATUS_COLOR[app.status]}`}>
                          {STATUS_LABEL[app.status]}
                        </span>
                        {app.tag && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(124,58,237,.1)] text-[#B09BF8] border border-[rgba(124,58,237,.2)]">
                            {TAG_LABEL[app.tag]}
                          </span>
                        )}
                        {app.interviews && app.interviews.length > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(59,130,246,.12)] text-[#60A5FA] border border-[rgba(59,130,246,.25)]">
                            📅 PV
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-t2 truncate mt-0.5">
                        <Link href={`/employer/jobs/${app.job.id}/applications`} onClick={(e) => e.stopPropagation()} className="hover:text-[#B09BF8] hover:underline">
                          {app.job.title}
                        </Link>
                        <span className="mx-1.5">·</span>
                        {fmtDate(app.appliedAt)}
                      </p>
                    </div>
                    <a
                      href={app.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="hidden sm:inline text-[12px] font-medium text-[#B09BF8] hover:underline shrink-0"
                    >
                      📎 CV
                    </a>
                    <span className={`shrink-0 text-t2 transition-transform ${expanded ? "rotate-180" : ""}`}>⌄</span>
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border-dark"
                      >
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                            <div>
                              <p className="text-[11px] text-t2 uppercase tracking-wider mb-1">Email</p>
                              <p className="text-t0 break-all">{app.candidate.user.email}</p>
                            </div>
                            {app.candidate.headline && (
                              <div>
                                <p className="text-[11px] text-t2 uppercase tracking-wider mb-1">Headline</p>
                                <p className="text-t0">{app.candidate.headline}</p>
                              </div>
                            )}
                            {app.candidate.location && (
                              <div>
                                <p className="text-[11px] text-t2 uppercase tracking-wider mb-1">Địa điểm</p>
                                <p className="text-t0">📍 {app.candidate.location}</p>
                              </div>
                            )}
                          </div>

                          {app.coverLetter && (
                            <div>
                              <p className="text-[11px] text-t2 uppercase tracking-wider mb-1">Cover letter</p>
                              <p className="text-[13px] text-t1 whitespace-pre-wrap leading-relaxed">{app.coverLetter}</p>
                            </div>
                          )}

                          {/* Status quick actions */}
                          <div>
                            <p className="text-[11px] text-t2 uppercase tracking-wider mb-2">Đổi trạng thái</p>
                            <div className="flex flex-wrap gap-2">
                              {(["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"] as Status[]).map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  disabled={statusMut.isPending || app.status === s}
                                  onClick={() => statusMut.mutate({ jobId: app.job.id, appId: app.id, status: s })}
                                  className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${STATUS_COLOR[s]} hover:brightness-125`}
                                >
                                  {STATUS_LABEL[s]}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Tag quick actions */}
                          <div>
                            <p className="text-[11px] text-t2 uppercase tracking-wider mb-2">Gắn tag</p>
                            <div className="flex flex-wrap gap-2">
                              {(["SHORTLISTED", "POTENTIAL", "ON_HOLD"] as Tag[]).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  disabled={tagMut.isPending}
                                  onClick={() => tagMut.mutate({ jobId: app.job.id, appId: app.id, tag: app.tag === t ? null : t })}
                                  className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                                    app.tag === t
                                      ? "bg-[rgba(124,58,237,.18)] text-white border-[rgba(124,58,237,.5)]"
                                      : "bg-bg-3 text-t1 border-border-dark hover:text-t0"
                                  }`}
                                >
                                  {TAG_LABEL[t]}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border-dark/50 flex flex-wrap gap-3 text-[12px]">
                            <Link
                              href={`/employer/jobs/${app.job.id}/applications`}
                              className="text-[#B09BF8] hover:underline font-semibold"
                            >
                              → Xem trong tin tuyển dụng
                            </Link>
                            <a
                              href={app.cvUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="sm:hidden text-[#B09BF8] hover:underline font-semibold"
                            >
                              📎 Mở CV
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <Pagination page={page} totalPages={data.totalPages} onPageChange={(p) => { setPage(p); setExpandedId(null); }} />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card-dark rounded-xl px-3 py-3">
      <p className="text-[10px] sm:text-[11px] text-t2 uppercase tracking-wider">{label}</p>
      <p className={`text-[20px] sm:text-[22px] font-extrabold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
