import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompareJob {
  id: string;
  title: string;
  company: string;
}

interface CompareState {
  compareJobs: CompareJob[];
  addJob: (job: CompareJob) => void;
  removeJob: (id: string) => void;
  clearJobs: () => void;
  isInCompare: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      compareJobs: [],
      addJob: (job) => {
        const { compareJobs } = get();
        if (compareJobs.length >= 3 || compareJobs.some((j) => j.id === job.id)) return;
        set({ compareJobs: [...compareJobs, job] });
      },
      removeJob: (id) =>
        set((s) => ({ compareJobs: s.compareJobs.filter((j) => j.id !== id) })),
      clearJobs: () => set({ compareJobs: [] }),
      isInCompare: (id) => get().compareJobs.some((j) => j.id === id),
    }),
    { name: "jobhub_compare" }
  )
);
