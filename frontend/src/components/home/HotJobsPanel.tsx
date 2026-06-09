"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { Row } from "@/components/ui/Row";
import { MonoNumber } from "@/components/ui/MonoNumber";
import api from "@/lib/api";

interface HotJob {
  id: string;
  title: string;
  location: string;
  workMode: string;
  jobType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  tier: string;
  createdAt: string;
  employer: { companyName: string };
}

function formatSalary(min: number | null, max: number | null, currency: string) {
  if (!min && !max) return "Thoả thuận";
  const unit = currency === "VND" ? "tr" : currency;
  const div = currency === "VND" ? 1_000_000 : 1;
  const lo = min ? Math.round(min / div) : null;
  const hi = max ? Math.round(max / div) : null;
  if (lo && hi) return `${lo}–${hi}${unit}`;
  if (lo) return `≥ ${lo}${unit}`;
  if (hi) return `≤ ${hi}${unit}`;
  return "Thoả thuận";
}

function relTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function modeLabel(m: string) {
  if (m === "REMOTE") return "remote";
  if (m === "HYBRID") return "hybrid";
  return "on-site";
}

const FALLBACK: HotJob[] = [
  { id: "1", title: "Senior Frontend Engineer", location: "Hà Nội", workMode: "REMOTE", jobType: "FULL_TIME", salaryMin: 40_000_000, salaryMax: 60_000_000, salaryCurrency: "VND", tier: "VIP", createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(), employer: { companyName: "Google Vietnam" } },
  { id: "2", title: "Product Manager", location: "TP.HCM", workMode: "ON_SITE", jobType: "FULL_TIME", salaryMin: 35_000_000, salaryMax: 50_000_000, salaryCurrency: "VND", tier: "PREMIUM", createdAt: new Date(Date.now() - 8 * 3600_000).toISOString(), employer: { companyName: "Shopee" } },
  { id: "3", title: "Data Engineer", location: "TP.HCM", workMode: "HYBRID", jobType: "FULL_TIME", salaryMin: 25_000_000, salaryMax: 40_000_000, salaryCurrency: "VND", tier: "BASIC", createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(), employer: { companyName: "VNG Corporation" } },
  { id: "4", title: "iOS Developer", location: "Hà Nội", workMode: "ON_SITE", jobType: "FULL_TIME", salaryMin: 20_000_000, salaryMax: 35_000_000, salaryCurrency: "VND", tier: "BASIC", createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(), employer: { companyName: "MoMo" } },
  { id: "5", title: "UX Designer", location: "Toàn quốc", workMode: "REMOTE", jobType: "FULL_TIME", salaryMin: 18_000_000, salaryMax: 30_000_000, salaryCurrency: "VND", tier: "PREMIUM", createdAt: new Date(Date.now() - 4 * 86400_000).toISOString(), employer: { companyName: "Zalo" } },
  { id: "6", title: "Backend Engineer (Node.js)", location: "TP.HCM", workMode: "HYBRID", jobType: "FULL_TIME", salaryMin: 22_000_000, salaryMax: 38_000_000, salaryCurrency: "VND", tier: "BASIC", createdAt: new Date(Date.now() - 5 * 86400_000).toISOString(), employer: { companyName: "Tiki" } },
];

const MOCK_MATCH = [92, 88, 81, 76, 73, 68];

export function HotJobsPanel() {
  const router = useRouter();
  const [jobs, setJobs] = useState<HotJob[]>(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .get("/jobs", { params: { limit: 6, page: 1 } })
      .then((res) => {
        const data = res.data?.jobs;
        if (Array.isArray(data) && data.length > 0) setJobs(data);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <HairlineSection
      label="HOT NÀY"
      meta={
        <span className="font-mono">
          {jobs.length} vị trí · cập nhật {loaded ? "now" : "..."}
        </span>
      }
      className="max-w-[1280px] mx-auto"
    >
      {jobs.map((j, i) => {
        const match = MOCK_MATCH[i] ?? 70;
        return (
          <Row key={j.id} onClick={() => router.push(`/jobs/${j.id}`)}>
            <Row.Lead>
              <MonoNumber size="lg" tone={match >= 85 ? "accent" : match >= 75 ? "default" : "muted"}>
                {match}
              </MonoNumber>
            </Row.Lead>
            <Row.Body
              title={j.title}
              meta={
                <span className="font-mono text-[12px]">
                  {j.employer.companyName} · {j.location} · {modeLabel(j.workMode)} · {relTime(j.createdAt)}
                </span>
              }
            />
            <Row.End>
              <MonoNumber size="md">
                {formatSalary(j.salaryMin, j.salaryMax, j.salaryCurrency)}
              </MonoNumber>
              {j.tier !== "BASIC" && (
                <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--accent)]">
                  {j.tier}
                </span>
              )}
            </Row.End>
          </Row>
        );
      })}
      <div className="px-4 md:px-6 py-4 border-t border-[var(--border)]">
        <button
          onClick={() => router.push("/jobs")}
          className="text-[13px] font-mono text-[var(--t1)] hover:text-[var(--accent)] transition-colors duration-100"
        >
          &gt; xem tất cả 12,400+ vị trí →
        </button>
      </div>
    </HairlineSection>
  );
}
