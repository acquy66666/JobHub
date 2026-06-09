"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { queryKeys } from "@/lib/queryKeys";
import { formatApplicationStatus, formatSalary, timeAgo } from "@/lib/formatters";
import { getRecentlyViewed, RecentlyViewedJob } from "@/lib/recentlyViewed";
import { skillsApi } from "@/lib/api/skills";
import api from "@/lib/api";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { Row } from "@/components/ui/Row";
import { MonoNumber } from "@/components/ui/MonoNumber";

interface AppItem {
  id: string;
  status: string;
  appliedAt: string;
  job: { id: string; title: string; employer: { companyName: string } };
}

interface RecJob {
  id: string;
  title: string;
  matchScore: number;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  employer: { companyName: string };
}

export default function CandidateDashboard() {
  const router = useRouter();
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedJob[]>([]);

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed().slice(0, 6));
  }, []);

  const { data: profile } = useQuery({
    queryKey: queryKeys.candidateProfile(),
    queryFn: () => api.get("/candidate/profile").then((r) => r.data),
  });

  useEffect(() => {
    if (!profile) return;
    const skipped = typeof window !== "undefined" && window.localStorage.getItem("onboarding_skipped") === "1";
    if (!skipped && (profile.skills?.length ?? 0) === 0) {
      router.replace("/candidate/onboarding");
    }
  }, [profile, router]);

  const { data: trendingSkills = [] } = useQuery({
    queryKey: ["skills", "trending", "dashboard", 6],
    queryFn: () => skillsApi.listTrending(6),
    staleTime: 5 * 60 * 1000,
  });

  const { data: appsData } = useQuery({
    queryKey: queryKeys.candidateApplications(1),
    queryFn: () => api.get("/candidate/applications", { params: { page: 1, limit: 5 } }).then((r) => r.data),
    staleTime: 30_000,
  });

  const { data: savedData } = useQuery({
    queryKey: queryKeys.candidateSavedJobs(1),
    queryFn: () => api.get("/candidate/saved-jobs", { params: { page: 1, limit: 1 } }).then((r) => r.data),
  });

  const { data: recommendedJobs = [] } = useQuery<RecJob[]>({
    queryKey: queryKeys.recommendedJobs(4),
    queryFn: () => api.get("/candidate/recommended-jobs?limit=4").then((r) => r.data),
  });

  const applications: AppItem[] = appsData?.applications ?? [];

  const completionItems = profile
    ? [
        !!profile.fullName,
        !!profile.phone,
        !!profile.headline,
        (profile.skills?.length ?? 0) > 0,
        !!profile.cvUrl,
        (profile.experiences?.length ?? 0) > 0,
        (profile.educations?.length ?? 0) > 0,
      ]
    : [];
  const completionDone = completionItems.filter(Boolean).length;
  const completionTotal = completionItems.length;
  const completionPct =
    completionTotal > 0 ? Math.round((completionDone / completionTotal) * 100) : 0;

  return (
    <div className="pb-10">
      <section className="px-4 md:px-6 py-8">
        <h1 className="text-[clamp(28px,4vw,42px)] font-medium tracking-tight text-[var(--t0)]">
          {profile?.fullName ? `Xin chào, ${profile.fullName}.` : "Xin chào."}
        </h1>
        <p className="font-mono text-[13px] text-[var(--t1)] mt-2">
          {`> hồ sơ ${completionPct}% · ${completionDone}/${completionTotal} mục hoàn thành`}
          {completionPct < 100 && (
            <>
              {" · "}
              <Link href="/candidate/profile" className="text-[var(--accent)] hover:underline">
                hoàn thiện →
              </Link>
            </>
          )}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mt-8">
          <Stat label="Đơn ứng tuyển" value={appsData?.total ?? 0} href="/candidate/applications" />
          <Stat label="Việc đã lưu" value={savedData?.total ?? 0} href="/candidate/saved-jobs" />
          <Stat label="Đã xem" value={recentlyViewed.length} href="/candidate/recently-viewed" />
          <Stat
            label="CV"
            valueText={profile?.cvUrl ? "có" : "—"}
            href="/candidate/cv"
          />
        </div>
      </section>

      <HairlineSection
        label="ĐƠN GẦN ĐÂY"
        meta={
          <Link href="/candidate/applications" className="hover:text-[var(--t0)]">
            xem tất cả →
          </Link>
        }
      >
        {applications.length === 0 ? (
          <Empty message="Bạn chưa ứng tuyển vị trí nào." cta={{ href: "/jobs", label: "tìm việc" }} />
        ) : (
          applications.map((app, i) => {
            const { label, color } = formatApplicationStatus(app.status);
            const idx = String(i + 1).padStart(2, "0");
            return (
              <Row
                key={app.id}
                as="a"
                href={`/candidate/applications`}
                className="cursor-pointer"
              >
                <Row.Lead>
                  <MonoNumber size="lg" tone="muted">{idx}</MonoNumber>
                </Row.Lead>
                <Row.Body
                  title={app.job.title}
                  meta={
                    <span className="font-mono text-[12px]">
                      {app.job.employer.companyName} · {timeAgo(app.appliedAt)}
                    </span>
                  }
                />
                <Row.End>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-sharp border ${color}`}>
                    {label}
                  </span>
                </Row.End>
              </Row>
            );
          })
        )}
      </HairlineSection>

      {recommendedJobs.length > 0 && (
        <HairlineSection
          label="ĐỀ XUẤT CHO BẠN"
          meta={
            <Link href="/candidate/recommended" className="hover:text-[var(--t0)]">
              xem tất cả →
            </Link>
          }
        >
          {recommendedJobs.map((job) => (
            <Row key={job.id} as="a" href={`/jobs/${job.id}`}>
              <Row.Lead>
                <MonoNumber
                  size="lg"
                  tone={job.matchScore >= 85 ? "accent" : job.matchScore >= 70 ? "default" : "muted"}
                >
                  {job.matchScore}
                </MonoNumber>
              </Row.Lead>
              <Row.Body
                title={job.title}
                meta={
                  <span className="font-mono text-[12px]">
                    {job.employer.companyName} · {job.location}
                  </span>
                }
              />
              <Row.End>
                <span className="font-mono text-[13px] text-[var(--t0)]">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </span>
              </Row.End>
            </Row>
          ))}
        </HairlineSection>
      )}

      {trendingSkills.length > 0 && (
        <HairlineSection label="TOP KỸ NĂNG ĐANG TUYỂN">
          <div className="px-4 md:px-6 py-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[13px]" data-testid="dashboard-trending">
            {trendingSkills.map((skill) => (
              <Link
                key={skill.slug}
                href={`/jobs?q=${encodeURIComponent(skill.nameVi)}`}
                className="text-[var(--t1)] hover:text-[var(--accent)] transition-colors"
              >
                {skill.nameVi}
                <span className="text-[var(--t2)] ml-1">({skill.jobCount})</span>
              </Link>
            ))}
          </div>
        </HairlineSection>
      )}

      {recentlyViewed.length > 0 && (
        <HairlineSection
          label="ĐÃ XEM GẦN ĐÂY"
          meta={
            <Link href="/candidate/recently-viewed" className="hover:text-[var(--t0)]">
              xem tất cả →
            </Link>
          }
        >
          {recentlyViewed.map((job, i) => (
            <Row key={job.id} as="a" href={`/jobs/${job.id}`}>
              <Row.Lead>
                <MonoNumber size="lg" tone="muted">{String(i + 1).padStart(2, "0")}</MonoNumber>
              </Row.Lead>
              <Row.Body
                title={job.title}
                meta={
                  <span className="font-mono text-[12px]">
                    {job.employer.companyName} · {timeAgo(job.viewedAt)}
                  </span>
                }
              />
              <Row.End>
                <span className="font-mono text-[13px] text-[var(--t0)]">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </span>
              </Row.End>
            </Row>
          ))}
        </HairlineSection>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  valueText,
  href,
}: {
  label: string;
  value?: number;
  valueText?: string;
  href: string;
}) {
  return (
    <Link href={href} className="block group">
      <MonoNumber size="lg" className="group-hover:text-[var(--accent)] transition-colors">
        {valueText ?? (typeof value === "number" ? value : "—")}
      </MonoNumber>
      <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--t1)] mt-2 font-semibold">
        {label}
      </div>
    </Link>
  );
}

function Empty({ message, cta }: { message: string; cta?: { href: string; label: string } }) {
  return (
    <div className="px-4 md:px-6 py-10 text-center">
      <p className="font-mono text-[13px] text-[var(--t2)]">{message}</p>
      {cta && (
        <Link
          href={cta.href}
          className="inline-block mt-3 font-mono text-[13px] text-[var(--accent)] hover:underline"
        >
          → {cta.label}
        </Link>
      )}
    </div>
  );
}
