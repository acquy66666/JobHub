import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jobhub.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/jobs`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/companies`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Fetch active jobs for dynamic sitemap entries
  let jobRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
    const res = await fetch(`${apiUrl}/jobs?limit=200&page=1`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const jobs: Array<{ id: string; updatedAt: string }> = data.data ?? [];
      jobRoutes = jobs.map((job) => ({
        url: `${base}/jobs/${job.id}`,
        lastModified: new Date(job.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Sitemap degrades gracefully if API is unavailable at build time
  }

  return [...staticRoutes, ...jobRoutes];
}
