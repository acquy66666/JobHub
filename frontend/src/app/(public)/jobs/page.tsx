import type { Metadata } from "next";
import { Suspense } from "react";
import { JobsContent } from "./JobsContent";
import { JobCardSkeleton } from "@/components/jobs/JobCardSkeleton";

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
    <div className="max-w-wrap mx-auto px-6 py-8 pt-24">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <div className="h-[600px] bg-bg-2 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      </div>
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
