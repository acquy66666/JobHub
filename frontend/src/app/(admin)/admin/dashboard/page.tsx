"use client";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  pendingJobs: number;
  monthlyData: { month: string; count: number }[];
  weeklyData: { week: string; users: number; jobs: number; applications: number }[];
}

const MONTH_LABELS: Record<string, string> = {
  "01": "T1", "02": "T2", "03": "T3", "04": "T4",
  "05": "T5", "06": "T6", "07": "T7", "08": "T8",
  "09": "T9", "10": "T10", "11": "T11", "12": "T12",
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: queryKeys.adminStats(),
    queryFn: () => api.get("/admin/stats").then((r) => r.data),
  });

  const stats = [
    { label: "Tổng người dùng", value: data?.totalUsers ?? 0, icon: "👥", href: "/admin/users", color: "text-[#B09BF8]" },
    { label: "Tổng việc làm", value: data?.totalJobs ?? 0, icon: "📋", href: "/admin/jobs", color: "text-[#60A5FA]" },
    { label: "Đơn ứng tuyển", value: data?.totalApplications ?? 0, icon: "📄", href: "/admin/jobs", color: "text-[#4ADE80]" },
    { label: "Tin chờ duyệt", value: data?.pendingJobs ?? 0, icon: "⏳", href: "/admin/jobs?status=PENDING", color: "text-[#FCD34D]" },
  ];

  const chartData = (data?.monthlyData ?? []).map((d) => ({
    name: MONTH_LABELS[d.month.slice(5, 7)] ?? d.month.slice(5, 7),
    "Tin đăng": d.count,
  }));

  const weeklyChartData = (data?.weeklyData ?? []).map((d) => {
    const [, m, day] = d.week.split("-");
    return {
      name: `${day}/${m}`,
      "Người dùng": d.users,
      "Tin đăng": d.jobs,
      "Đơn nộp": d.applications,
    };
  });

  return (
    <div className="p-8 max-w-5xl">
      <ScrollReveal direction="up" className="mb-8">
        <h1 className="text-[28px] font-extrabold text-t0 tracking-tight">Tổng quan hệ thống</h1>
        <p className="text-[15px] text-t1 mt-1">Thống kê và quản lý toàn bộ nền tảng JobHub.</p>
      </ScrollReveal>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <ScrollReveal key={stat.label} direction="up" delay={i * 0.08}>
            <Link href={stat.href} className="card-dark p-5 rounded-2xl block hover:border-[rgba(124,58,237,.4)] transition-colors">
              <span className="text-2xl">{stat.icon}</span>
              {isLoading ? (
                <div className="h-8 w-16 bg-bg-3 rounded-lg animate-pulse mt-2" />
              ) : (
                <p className={`text-[28px] font-extrabold mt-2 ${stat.color}`}>{stat.value}</p>
              )}
              <p className="text-[12px] text-t2 mt-0.5">{stat.label}</p>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      {/* Chart */}
      <ScrollReveal direction="up" delay={0.15}>
        <div className="card-dark rounded-2xl p-6">
          <h3 className="text-[15px] font-bold text-t0 mb-5">Tin đăng theo tháng (6 tháng gần nhất)</h3>
          {isLoading ? (
            <div className="h-[240px] bg-bg-3 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252538" />
                <XAxis dataKey="name" tick={{ fill: "#9494B0", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9494B0", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#13131E", border: "1px solid #252538", borderRadius: 10, color: "#F5F5FF" }}
                  cursor={{ fill: "rgba(124,58,237,.08)" }}
                />
                <Bar dataKey="Tin đăng" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ScrollReveal>

      {/* Weekly trend LineChart */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="card-dark rounded-2xl p-6 mt-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-bold text-t0">Xu hướng 8 tuần gần nhất</h3>
            <div className="flex items-center gap-4 text-[12px] text-t2">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-[#B09BF8]" />Người dùng</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-[#60A5FA]" />Tin đăng</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-[#4ADE80]" />Đơn nộp</span>
            </div>
          </div>
          {isLoading ? (
            <div className="h-[240px] bg-bg-3 rounded-xl animate-pulse" />
          ) : weeklyChartData.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-t2 text-[13px]">Chưa có dữ liệu tuần</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={weeklyChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252538" />
                <XAxis dataKey="name" tick={{ fill: "#9494B0", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9494B0", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#13131E", border: "1px solid #252538", borderRadius: 10, color: "#F5F5FF", fontSize: 13 }}
                  cursor={{ stroke: "rgba(124,58,237,.2)", strokeWidth: 1 }}
                />
                <Line type="monotone" dataKey="Người dùng" stroke="#B09BF8" strokeWidth={2} dot={{ r: 3, fill: "#B09BF8" }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Tin đăng" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3, fill: "#60A5FA" }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Đơn nộp" stroke="#4ADE80" strokeWidth={2} dot={{ r: 3, fill: "#4ADE80" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </ScrollReveal>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <ScrollReveal direction="left" delay={0.1}>
          <Link href="/admin/jobs?status=PENDING" className="card-dark rounded-2xl p-5 flex items-center gap-4 hover:border-[rgba(245,158,11,.4)] transition-colors">
            <span className="text-3xl">⏳</span>
            <div>
              <p className="text-[14px] font-bold text-t0">Tin chờ duyệt</p>
              <p className="text-[12px] text-t2">Duyệt hoặc từ chối tin mới</p>
            </div>
          </Link>
        </ScrollReveal>
        <ScrollReveal direction="right" delay={0.1}>
          <Link href="/admin/users" className="card-dark rounded-2xl p-5 flex items-center gap-4 hover:border-[rgba(59,130,246,.4)] transition-colors">
            <span className="text-3xl">👥</span>
            <div>
              <p className="text-[14px] font-bold text-t0">Quản lý users</p>
              <p className="text-[12px] text-t2">Xem, ban/unban tài khoản</p>
            </div>
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
