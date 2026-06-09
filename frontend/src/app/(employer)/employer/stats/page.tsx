"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { formatJobStatus } from "@/lib/formatters";
import api from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { MonoNumber } from "@/components/ui/MonoNumber";

interface JobStat {
  id: string;
  title: string;
  status: string;
  viewCount: number;
  applicationCount: number;
  acceptedCount: number;
  conversionRate: number;
  createdAt: string;
}

interface StatsData {
  jobs: JobStat[];
  summary: {
    totalJobs: number;
    totalViews: number;
    totalApplications: number;
    avgConversionRate: number;
  };
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-sharp p-3 text-[12px] font-mono">
      <p className="font-semibold text-[var(--t0)] mb-2 truncate max-w-[160px]">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="mb-0.5">
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function EmployerStatsPage() {
  const { data, isLoading } = useQuery<StatsData>({
    queryKey: queryKeys.employerJobStats(),
    queryFn: () => api.get("/employer/job-stats").then((r) => r.data),
  });

  const summary = data?.summary;
  const jobs = data?.jobs ?? [];
  const chartData = jobs.slice(0, 10).map((j) => ({
    name: j.title.length > 16 ? j.title.slice(0, 16) + "…" : j.title,
    "Lượt xem": j.viewCount,
    "Đơn nhận": j.applicationCount,
    "Chấp nhận": j.acceptedCount,
  }));

  const summaryStats = [
    { label: "tin đăng", value: summary?.totalJobs ?? 0 },
    { label: "lượt xem", value: summary?.totalViews ?? 0 },
    { label: "đơn nhận", value: summary?.totalApplications ?? 0 },
    { label: "CV/view TB", value: `${summary?.avgConversionRate ?? 0}%` },
  ];

  return (
    <div className="pb-10">
      <section className="px-4 md:px-6 py-8">
        <h1 className="text-[clamp(26px,3.5vw,36px)] font-medium tracking-tight text-[var(--t0)]">
          Thống kê
        </h1>
        <p className="font-mono text-[13px] text-[var(--t1)] mt-2">
          {`> theo dõi lượt xem · đơn ứng tuyển · tỷ lệ chuyển đổi`}
        </p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-[var(--border)]">
        {summaryStats.map((s, i) => (
          <div
            key={s.label}
            className={`px-4 md:px-6 py-5 border-[var(--border)] ${i < 3 ? "border-r" : ""} ${
              i < 2 ? "border-b md:border-b-0" : ""
            }`}
          >
            <MonoNumber size="lg">{isLoading ? "—" : s.value}</MonoNumber>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--t2)] mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {!isLoading && chartData.length > 0 && (
        <HairlineSection label="SO SÁNH TIN ĐĂNG">
          <div className="p-4 md:p-6 overflow-x-auto">
            <div style={{ minWidth: 560 }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,37,56,.6)" />
                  <XAxis dataKey="name" tick={{ fill: "#55556A", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#55556A", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,.06)" }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#9494B0", paddingTop: 12 }} />
                  <Bar dataKey="Lượt xem" fill="rgba(59,130,246,.7)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Đơn nhận" fill="rgba(124,58,237,.8)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Chấp nhận" fill="rgba(34,197,94,.7)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </HairlineSection>
      )}

      <HairlineSection label="CHI TIẾT TỪNG TIN">
        {isLoading ? (
          <p className="px-4 md:px-6 py-8 font-mono text-[13px] text-[var(--t2)]">đang tải…</p>
        ) : jobs.length === 0 ? (
          <p className="px-4 md:px-6 py-10 font-mono text-[13px] text-[var(--t2)] text-center">
            Chưa có tin tuyển dụng nào.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] font-mono">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[11px] uppercase tracking-wider text-[var(--t2)]">
                  <th className="px-4 md:px-6 py-3 font-medium">Vị trí</th>
                  <th className="px-3 py-3 font-medium text-right">Lượt xem</th>
                  <th className="px-3 py-3 font-medium text-right">Đơn</th>
                  <th className="px-3 py-3 font-medium text-right">Nhận</th>
                  <th className="px-3 py-3 font-medium text-right">CV/View</th>
                  <th className="px-3 py-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const { label, color } = formatJobStatus(job.status);
                  return (
                    <tr
                      key={job.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--accent-dim)] transition-colors"
                    >
                      <td className="px-4 md:px-6 py-3 font-sans font-semibold text-[var(--t0)] max-w-[220px] truncate">
                        {job.title}
                      </td>
                      <td className="px-3 py-3 text-right text-[var(--t1)] tabular-nums">
                        {job.viewCount.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right text-[var(--t1)] tabular-nums">
                        {job.applicationCount}
                      </td>
                      <td className="px-3 py-3 text-right text-[var(--green)] tabular-nums">
                        {job.acceptedCount}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        <span
                          className={
                            job.conversionRate >= 10
                              ? "text-[var(--green)]"
                              : job.conversionRate >= 3
                              ? "text-yellow-400"
                              : "text-[var(--t2)]"
                          }
                        >
                          {job.conversionRate}%
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-sharp border ${color}`}>
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </HairlineSection>
    </div>
  );
}
