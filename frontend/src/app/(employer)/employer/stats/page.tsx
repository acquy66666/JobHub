"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { formatJobStatus } from "@/lib/formatters";
import api from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";

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

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-2 border border-border-dark rounded-xl p-3 text-[12px] shadow-xl">
      <p className="font-semibold text-t0 mb-2 truncate max-w-[160px]">{label}</p>
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

  const summaryCards = [
    { label: "Tổng tin đăng", value: summary?.totalJobs ?? 0, icon: "📋", color: "text-[#B09BF8]" },
    { label: "Tổng lượt xem", value: summary?.totalViews ?? 0, icon: "👁", color: "text-[#60A5FA]" },
    { label: "Tổng đơn nhận", value: summary?.totalApplications ?? 0, icon: "👥", color: "text-[#4ADE80]" },
    { label: "Tỷ lệ ứng tuyển TB", value: `${summary?.avgConversionRate ?? 0}%`, icon: "📈", color: "text-[#FCD34D]" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl space-y-8">
      <ScrollReveal direction="up">
        <h1 className="text-[24px] font-extrabold text-t0 mb-1">Thống kê hiệu quả tuyển dụng</h1>
        <p className="text-[14px] text-t1">Theo dõi lượt xem, đơn ứng tuyển và tỷ lệ chuyển đổi cho từng tin đăng.</p>
      </ScrollReveal>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((c, i) => (
          <ScrollReveal key={c.label} direction="up" delay={i * 0.07}>
            <div className="card-dark p-5 rounded-2xl">
              <span className="text-2xl">{c.icon}</span>
              <p className={`text-[28px] font-extrabold mt-2 ${c.color}`}>{isLoading ? "—" : c.value}</p>
              <p className="text-[12px] text-t2 mt-0.5">{c.label}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Bar chart */}
      {!isLoading && chartData.length > 0 && (
        <ScrollReveal direction="up" delay={0.1}>
          <div className="card-dark p-6 rounded-2xl">
            <h3 className="text-[15px] font-bold text-t0 mb-6">So sánh hiệu quả các tin đăng</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,37,56,.6)" />
                <XAxis dataKey="name" tick={{ fill: "#55556A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#55556A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,.06)" }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#9494B0", paddingTop: 12 }} />
                <Bar dataKey="Lượt xem" fill="rgba(59,130,246,.7)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Đơn nhận" fill="rgba(124,58,237,.8)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Chấp nhận" fill="rgba(34,197,94,.7)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ScrollReveal>
      )}

      {/* Table */}
      <ScrollReveal direction="up" delay={0.15}>
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border-dark">
            <h3 className="text-[15px] font-bold text-t0">Chi tiết từng tin</h3>
          </div>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-bg-3 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[14px] text-t2">Chưa có tin tuyển dụng nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border-dark text-left">
                    <th className="px-5 py-3 text-t2 font-medium">Vị trí</th>
                    <th className="px-4 py-3 text-t2 font-medium text-right">Lượt xem</th>
                    <th className="px-4 py-3 text-t2 font-medium text-right">Đơn nhận</th>
                    <th className="px-4 py-3 text-t2 font-medium text-right">Chấp nhận</th>
                    <th className="px-4 py-3 text-t2 font-medium text-right">Tỷ lệ CV/View</th>
                    <th className="px-4 py-3 text-t2 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark/50">
                  {jobs.map((job) => {
                    const { label, color } = formatJobStatus(job.status);
                    return (
                      <tr key={job.id} className="hover:bg-white/[.02] transition-colors">
                        <td className="px-5 py-3 font-medium text-t0 max-w-[220px]">
                          <p className="truncate">{job.title}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-[#60A5FA] font-semibold">{job.viewCount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-[#B09BF8] font-semibold">{job.applicationCount}</td>
                        <td className="px-4 py-3 text-right text-[#4ADE80] font-semibold">{job.acceptedCount}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${job.conversionRate >= 10 ? "text-[#4ADE80]" : job.conversionRate >= 3 ? "text-[#FCD34D]" : "text-t2"}`}>
                            {job.conversionRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${color}`}>{label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
