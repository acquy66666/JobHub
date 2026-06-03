const KEY = 'jobhub_recently_viewed';
const MAX = 20;

export interface RecentlyViewedJob {
  id: string;
  title: string;
  employer: { companyName: string; logoUrl?: string | null };
  location: string;
  jobType: string;
  workMode: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  industry: string;
  createdAt: string;
  viewedAt: string;
}

export function addRecentlyViewed(job: RecentlyViewedJob): void {
  try {
    const existing = getRecentlyViewed().filter((j) => j.id !== job.id);
    const updated = [job, ...existing].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export function getRecentlyViewed(): RecentlyViewedJob[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentlyViewedJob[];
  } catch {
    return [];
  }
}

export function clearRecentlyViewed(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
