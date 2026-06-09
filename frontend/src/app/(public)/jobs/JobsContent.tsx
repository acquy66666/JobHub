"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { Row } from "@/components/ui/Row";
import { MonoNumber } from "@/components/ui/MonoNumber";
import { CmdK } from "@/components/search/CmdK";
import { SidePanel } from "@/components/ui/SidePanel";
import { ApplyModal } from "@/components/jobs/ApplyModal";
import { useAuthStore } from "@/store/authStore";
import { computeMatchScore } from "@/lib/matchScore";
import api from "@/lib/api";

const LIMIT = 20;

interface JobListItem {
  id: string;
  title: string;
  location: string;
  jobType: string;
  workMode: string;
  industry: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  tier?: string;
  requirements?: string;
  createdAt: string;
  employer: { id: string; companyName: string; logoUrl?: string | null };
}

function formatSalary(min?: number | null, max?: number | null, currency?: string) {
  if (!min && !max) return "Thoả thuận";
  const unit = currency === "VND" || !currency ? "tr" : currency;
  const div = currency === "VND" || !currency ? 1_000_000 : 1;
  const lo = min ? Math.round(min / div) : null;
  const hi = max ? Math.round(max / div) : null;
  if (lo && hi) return `${lo}–${hi}${unit}`;
  if (lo) return `≥ ${lo}${unit}`;
  if (hi) return `≤ ${hi}${unit}`;
  return "Thoả thuận";
}

function relTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function modeLabel(m: string) {
  if (m === "REMOTE") return "remote";
  if (m === "HYBRID") return "hybrid";
  return "on-site";
}

function typeLabel(t: string) {
  const map: Record<string, string> = {
    FULL_TIME: "full-time",
    PART_TIME: "part-time",
    CONTRACT: "contract",
    INTERNSHIP: "intern",
    FREELANCE: "freelance",
  };
  return map[t] ?? t.toLowerCase();
}

export function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const q = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const selectedJobId = searchParams.get("job");

  const filters = { keyword: q || undefined, page, limit: LIMIT };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.jobs(filters),
    queryFn: () => api.get("/jobs", { params: filters }).then((r) => r.data),
  });

  const { data: profile } = useQuery({
    queryKey: queryKeys.candidateProfile(),
    queryFn: () => api.get("/candidate/profile").then((r) => r.data),
    enabled: user?.role === "CANDIDATE",
  });

  const candidateSkills: string[] = profile?.skills ?? [];

  const jobs: JobListItem[] = data?.jobs ?? [];
  const totalPages: number = data?.totalPages ?? 1;
  const total: number = data?.total ?? 0;

  function pushParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v == null || v === "") params.delete(k);
      else params.set(k, v);
    });
    router.push(`/jobs${params.toString() ? `?${params}` : ""}`);
  }

  function handleSubmitSearch(raw: string) {
    pushParams({ q: raw.trim() || null, page: null });
  }

  function openJob(id: string) {
    pushParams({ job: id });
  }

  function closeJob() {
    pushParams({ job: null });
  }

  function goPage(p: number) {
    pushParams({ page: p > 1 ? String(p) : null });
  }

  return (
    <>
      <div className="max-w-[1280px] mx-auto pt-20">
        {/* Breadcrumb */}
        <div className="px-4 md:px-6 py-4 font-mono text-[12px] text-[var(--t2)]">
          <Link href="/" className="hover:text-[var(--t0)] transition-colors">~</Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--t1)]">jobs</span>
          {q && (
            <>
              <span className="mx-2">?</span>
              <span className="text-[var(--accent)]">q={q}</span>
            </>
          )}
        </div>

        {/* Sticky CmdK */}
        <div className="sticky top-16 z-20 bg-[var(--bg-0)] border-b border-[var(--border)] px-4 md:px-6 py-4">
          <CmdK
            size="md"
            defaultValue={q}
            onSubmit={handleSubmitSearch}
            placeholder="Tìm việc — gõ skill, công ty, location…"
          />
        </div>

        {/* Results list */}
        <HairlineSection
          label="KẾT QUẢ"
          meta={
            <span className="font-mono">
              {isLoading
                ? "đang tải..."
                : total === 0
                ? "0 kết quả"
                : `${total} vị trí · trang ${page}/${totalPages}`}
            </span>
          }
          topRule={false}
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border-b border-[var(--border)] min-h-[var(--row-h)] px-4 md:px-6 flex items-center"
              >
                <div className="w-16 h-6 bg-[var(--bg-2)] animate-pulse rounded-sharp mr-4" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[var(--bg-2)] animate-pulse rounded-sharp w-1/2" />
                  <div className="h-3 bg-[var(--bg-2)] animate-pulse rounded-sharp w-1/3" />
                </div>
              </div>
            ))
          ) : jobs.length === 0 ? (
            <div className="px-4 md:px-6 py-16 font-mono text-[14px] text-[var(--t1)]">
              <div className="text-[var(--t0)] mb-2">&gt; không tìm thấy việc làm</div>
              <div className="text-[12px] text-[var(--t2)]">
                thử từ khoá khác · hoặc xoá filter ở thanh tìm kiếm
              </div>
            </div>
          ) : (
            <>
              {jobs.map((job, i) => {
                const match =
                  user?.role === "CANDIDATE" && candidateSkills.length > 0 && job.requirements
                    ? computeMatchScore(candidateSkills, job.requirements).score
                    : null;
                const indexNum = (page - 1) * LIMIT + i + 1;
                return (
                  <Row
                    key={job.id}
                    active={selectedJobId === job.id}
                    onClick={() => openJob(job.id)}
                  >
                    <Row.Lead>
                      {match != null ? (
                        <MonoNumber
                          size="lg"
                          tone={match >= 85 ? "accent" : match >= 70 ? "default" : "muted"}
                        >
                          {match}
                        </MonoNumber>
                      ) : (
                        <MonoNumber size="md" tone="muted">
                          {String(indexNum).padStart(2, "0")}
                        </MonoNumber>
                      )}
                    </Row.Lead>
                    <Row.Body
                      title={job.title}
                      meta={
                        <span className="font-mono text-[12px]">
                          {job.employer.companyName} · {job.location} · {modeLabel(job.workMode)} · {typeLabel(job.jobType)} · {relTime(job.createdAt)}
                        </span>
                      }
                    />
                    <Row.End>
                      <MonoNumber size="md">
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                      </MonoNumber>
                      {job.tier && job.tier !== "BASIC" && (
                        <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--accent)]">
                          {job.tier}
                        </span>
                      )}
                    </Row.End>
                  </Row>
                );
              })}

              {/* Pagination footer */}
              <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-[var(--border)] font-mono text-[13px]">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => goPage(page - 1)}
                  className="inline-flex items-center gap-1.5 text-[var(--t1)] hover:text-[var(--accent)] disabled:opacity-30 disabled:hover:text-[var(--t1)] transition-colors"
                >
                  <ChevronLeft size={14} /> prev
                </button>
                <span className="text-[var(--t2)]">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => goPage(page + 1)}
                  className="inline-flex items-center gap-1.5 text-[var(--t1)] hover:text-[var(--accent)] disabled:opacity-30 disabled:hover:text-[var(--t1)] transition-colors"
                >
                  next <ChevronRight size={14} />
                </button>
              </div>
            </>
          )}
        </HairlineSection>
      </div>

      <JobDetailSidePanel jobId={selectedJobId} onClose={closeJob} />
    </>
  );
}

function JobDetailSidePanel({ jobId, onClose }: { jobId: string | null; onClose: () => void }) {
  const open = !!jobId;
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    if (!open) setApplyOpen(false);
  }, [open]);

  const { data: job, isLoading } = useQuery({
    queryKey: queryKeys.job(jobId ?? ""),
    queryFn: () => api.get(`/jobs/${jobId}`).then((r) => r.data),
    enabled: open,
  });

  return (
    <>
      <SidePanel
        open={open}
        onOpenChange={(o) => !o && onClose()}
        title={job?.title ?? (isLoading ? "Đang tải…" : "")}
        meta={
          job && (
            <span>
              {job.employer?.companyName} · {job.location} · {modeLabel(job.workMode)} · {typeLabel(job.jobType)}
            </span>
          )
        }
      >
        {isLoading || !job ? (
          <div className="font-mono text-[13px] text-[var(--t2)]">&gt; loading…</div>
        ) : (
          <div className="space-y-6 text-[14px] text-[var(--t1)] leading-[1.7]">
            <div className="flex flex-wrap gap-4 font-mono text-[12px] text-[var(--t1)]">
              <span>
                <span className="text-[var(--t2)]">salary:</span>{" "}
                <span className="text-[var(--t0)]">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </span>
              </span>
              <span>
                <span className="text-[var(--t2)]">industry:</span>{" "}
                <span className="text-[var(--t0)]">{job.industry}</span>
              </span>
              <span>
                <span className="text-[var(--t2)]">posted:</span>{" "}
                <span className="text-[var(--t0)]">{relTime(job.createdAt)}</span>
              </span>
              {job.tier && job.tier !== "BASIC" && (
                <span className="text-[var(--accent)] uppercase tracking-[0.1em]">{job.tier}</span>
              )}
            </div>

            <Section title="MÔ TẢ">
              <p className="whitespace-pre-wrap">{job.description}</p>
            </Section>

            <Section title="YÊU CẦU">
              <p className="whitespace-pre-wrap">{job.requirements}</p>
            </Section>

            {job.benefits && (
              <Section title="PHÚC LỢI">
                <p className="whitespace-pre-wrap">{job.benefits}</p>
              </Section>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setApplyOpen(true)}
                className="px-4 py-2 bg-[var(--accent)] text-[var(--bg-0)] font-mono text-[13px] uppercase tracking-[0.08em] rounded-sharp hover:opacity-90 transition-opacity"
              >
                Ứng tuyển
              </button>
              <Link
                href={`/jobs/${job.id}`}
                className="font-mono text-[13px] text-[var(--t1)] hover:text-[var(--accent)] transition-colors"
              >
                &gt; xem trang đầy đủ →
              </Link>
            </div>
          </div>
        )}
      </SidePanel>

      {job && (
        <ApplyModal
          jobId={job.id}
          jobTitle={job.title}
          isOpen={applyOpen}
          onClose={() => setApplyOpen(false)}
        />
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-[var(--t2)] mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}
