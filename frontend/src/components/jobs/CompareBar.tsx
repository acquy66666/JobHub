"use client";
import { useEffect, useState } from "react";
import { useCompareStore } from "@/store/compareStore";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export function CompareBar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { compareJobs, removeJob, clearJobs } = useCompareStore();
  const router = useRouter();

  const visible = mounted && compareJobs.length > 0;
  const canCompare = compareJobs.length >= 2;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="compare-bar"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="fixed bottom-4 left-0 right-0 z-50 px-4 pointer-events-none"
        >
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="bg-bg-1 border border-border-dark rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,.5)] p-3 flex items-center gap-3">
              {/* Slots */}
              <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
                {[0, 1, 2].map((i) => {
                  const job = compareJobs[i];
                  return job ? (
                    <div
                      key={job.id}
                      className="flex items-center gap-1.5 bg-bg-3 border border-border-dark rounded-xl px-3 py-2 min-w-0 flex-1"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-t0 truncate">{job.title}</p>
                        <p className="text-[10px] text-t2 truncate">{job.company}</p>
                      </div>
                      <button
                        onClick={() => removeJob(job.id)}
                        className="shrink-0 text-t2 hover:text-[#EF4444] transition-colors"
                        title="Bỏ khỏi so sánh"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div
                      key={`empty-${i}`}
                      className="hidden sm:flex items-center justify-center flex-1 h-[52px] rounded-xl border border-dashed border-border-dark"
                    >
                      <p className="text-[10px] text-t2">+ Thêm việc làm</p>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={clearJobs}
                  className="px-3 py-2 rounded-xl border border-border-dark text-[12px] text-t1 hover:text-t0 hover:bg-white/[.04] transition-colors whitespace-nowrap"
                >
                  Xóa
                </button>
                <button
                  onClick={() => router.push("/candidate/compare")}
                  disabled={!canCompare}
                  className="btn-primary px-4 py-2 rounded-xl text-[12px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  So sánh ({compareJobs.length})
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
