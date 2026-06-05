"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface BenchmarkData {
  count: number;
  enough: boolean;
  currency: string;
  min?: number;
  max?: number;
  avg?: number;
  p25?: number;
  p50?: number;
  p75?: number;
}

const fmt = (v?: number) => {
  if (!v || v <= 0) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}tr`;
  return `${Math.round(v / 1000)}k`;
};

export function SalaryBenchmarkWidget({ title, industry }: { title: string; industry: string }) {
  const [debouncedTitle, setDebouncedTitle] = useState(title);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTitle(title), 500);
    return () => clearTimeout(t);
  }, [title]);

  const enabled = !!industry && (debouncedTitle.trim().length >= 3 || !debouncedTitle.trim());
  const { data, isLoading } = useQuery<BenchmarkData>({
    queryKey: ["salary-benchmark", debouncedTitle.trim().toLowerCase(), industry],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (debouncedTitle.trim().length >= 3) params.title = debouncedTitle.trim();
      if (industry) params.industry = industry;
      const res = await api.get("/employer/salary-benchmark", { params });
      return res.data;
    },
    enabled,
    staleTime: 60_000,
  });

  if (!enabled) return null;

  return (
    <div
      data-testid="salary-benchmark-widget"
      className="rounded-2xl border border-[rgba(124,58,237,.25)] bg-gradient-to-br from-[rgba(124,58,237,.07)] to-[rgba(59,130,246,.05)] p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[13px] font-bold text-t0 flex items-center gap-1.5">
          <span>📊</span> Mức lương thị trường
        </h4>
        {data && (
          <span className="text-[11px] text-t2">
            {data.count} tin tương tự
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="h-16 rounded-lg bg-bg-3 animate-pulse" />
      ) : !data || !data.enough ? (
        <p className="text-[12px] text-t2">
          Chưa đủ dữ liệu để so sánh (cần ≥3 tin tương tự — hiện có {data?.count ?? 0}).
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-center px-2 py-2 rounded-lg bg-bg-2/60">
              <div className="text-[10px] text-t2 uppercase tracking-wide">Thấp (P25)</div>
              <div className="text-[14px] font-bold text-t0 mt-0.5">{fmt(data.p25)}</div>
            </div>
            <div className="text-center px-2 py-2 rounded-lg bg-[rgba(124,58,237,.12)] border border-[rgba(124,58,237,.25)]">
              <div className="text-[10px] text-[#B09BF8] uppercase tracking-wide">Trung vị (P50)</div>
              <div className="text-[14px] font-bold text-white mt-0.5">{fmt(data.p50)}</div>
            </div>
            <div className="text-center px-2 py-2 rounded-lg bg-bg-2/60">
              <div className="text-[10px] text-t2 uppercase tracking-wide">Cao (P75)</div>
              <div className="text-[14px] font-bold text-t0 mt-0.5">{fmt(data.p75)}</div>
            </div>
          </div>
          <p className="text-[11px] text-t2">
            AVG: {fmt(data.avg)} · Min: {fmt(data.min)} · Max: {fmt(data.max)} ({data.currency})
          </p>
        </>
      )}
    </div>
  );
}
