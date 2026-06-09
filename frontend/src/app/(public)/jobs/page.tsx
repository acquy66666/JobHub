import type { Metadata } from "next";
import { Suspense } from "react";
import { JobsContent } from "./JobsContent";

export const metadata: Metadata = {
  title: "Tìm việc làm",
  description:
    "Hàng nghìn việc làm IT, tài chính, marketing, thiết kế tại Việt Nam chờ bạn khám phá. Lọc theo ngành nghề, địa điểm, mức lương.",
  openGraph: {
    title: "Tìm việc làm | JobHub",
    description: "Hàng nghìn việc làm IT, tài chính, marketing chờ bạn khám phá.",
  },
};

function JobsPageSkeleton() {
  return (
    <div className="max-w-[1280px] mx-auto pt-20 px-4 md:px-6">
      <div className="font-mono text-[12px] text-[var(--t2)] py-4">~ / jobs</div>
      <div className="h-11 bg-[var(--bg-2)] animate-pulse rounded-sharp mb-6" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="border-b border-[var(--border)] min-h-[var(--row-h)] flex items-center gap-4"
        >
          <div className="w-16 h-6 bg-[var(--bg-2)] animate-pulse rounded-sharp" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[var(--bg-2)] animate-pulse rounded-sharp w-1/2" />
            <div className="h-3 bg-[var(--bg-2)] animate-pulse rounded-sharp w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsPageSkeleton />}>
      <JobsContent />
    </Suspense>
  );
}
