"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import { timeAgo } from "@/lib/formatters";
import api from "@/lib/api";

interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  admin: { id: string; email: string };
}

const ACTION_OPTIONS = [
  { value: "", label: "Tất cả hành động" },
  { value: "JOB_APPROVED", label: "Duyệt tin" },
  { value: "JOB_REJECTED", label: "Từ chối tin" },
  { value: "USER_BANNED", label: "Khóa tài khoản" },
  { value: "USER_UNBANNED", label: "Mở khóa tài khoản" },
  { value: "USER_ROLE_CHANGED", label: "Đổi role" },
  { value: "EMPLOYER_VERIFIED", label: "Xác thực NTD" },
  { value: "EMPLOYER_UNVERIFIED", label: "Bỏ xác thực NTD" },
  { value: "REPORT_REVIEWED", label: "Xem xét báo cáo" },
  { value: "REPORT_DISMISSED", label: "Bỏ qua báo cáo" },
];

const ACTION_STYLES: Record<string, string> = {
  JOB_APPROVED: "bg-[rgba(34,197,94,.1)] text-[#4ADE80] border-[rgba(34,197,94,.2)]",
  JOB_REJECTED: "bg-[rgba(239,68,68,.1)] text-[#F87171] border-[rgba(239,68,68,.2)]",
  USER_BANNED: "bg-[rgba(239,68,68,.1)] text-[#F87171] border-[rgba(239,68,68,.2)]",
  USER_UNBANNED: "bg-[rgba(34,197,94,.1)] text-[#4ADE80] border-[rgba(34,197,94,.2)]",
  USER_ROLE_CHANGED: "bg-[rgba(59,130,246,.1)] text-[#60A5FA] border-[rgba(59,130,246,.2)]",
  EMPLOYER_VERIFIED: "bg-[rgba(34,197,94,.1)] text-[#4ADE80] border-[rgba(34,197,94,.2)]",
  EMPLOYER_UNVERIFIED: "bg-[rgba(245,158,11,.12)] text-[#FCD34D] border-[rgba(245,158,11,.2)]",
  REPORT_REVIEWED: "bg-[rgba(59,130,246,.1)] text-[#60A5FA] border-[rgba(59,130,246,.2)]",
  REPORT_DISMISSED: "bg-[rgba(148,148,176,.08)] text-t2 border-border-dark",
};

const TARGET_ICONS: Record<string, string> = {
  JOB: "📋",
  USER: "👤",
  REPORT: "⚑",
};

export default function AdminLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");

  const params = { page, limit: 20, ...(action ? { action } : {}) };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminLogs(params),
    queryFn: () => api.get("/admin/logs", { params }).then((r) => r.data),
  });

  const actionLabel = (a: string) => ACTION_OPTIONS.find((o) => o.value === a)?.label ?? a;

  return (
    <div className="p-6 max-w-5xl">
      <ScrollReveal direction="up">
        <h1 className="text-[22px] font-extrabold text-t0 mb-1">Audit Logs</h1>
        <p className="text-[14px] text-t1 mb-6">
          {data?.total ?? 0} bản ghi hoạt động của admin
        </p>
      </ScrollReveal>

      {/* Filter */}
      <ScrollReveal direction="up" delay={0.05}>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="bg-bg-2 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0 focus:outline-none focus:border-primary"
          >
            {ACTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </ScrollReveal>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-bg-2 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data?.logs?.length ? (
        <ScrollReveal direction="up">
          <div className="text-center py-16 text-t2 text-[14px]">
            Chưa có bản ghi nào
          </div>
        </ScrollReveal>
      ) : (
        <div className="bg-bg-2 border border-border-dark rounded-2xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border-dark">
                <th className="text-left px-4 py-3 text-t2 font-semibold">Hành động</th>
                <th className="text-left px-4 py-3 text-t2 font-semibold hidden sm:table-cell">Đối tượng</th>
                <th className="text-left px-4 py-3 text-t2 font-semibold hidden md:table-cell">Admin</th>
                <th className="text-left px-4 py-3 text-t2 font-semibold">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {data.logs.map((log: AuditLog) => (
                <tr key={log.id} className="hover:bg-bg-3 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${ACTION_STYLES[log.action] ?? "bg-bg-3 text-t1 border-border-dark"}`}>
                      {actionLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-t1">
                      {TARGET_ICONS[log.targetType] ?? "•"}{" "}
                      <span className="font-mono text-[11px] text-t2">{log.targetId.slice(0, 10)}…</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-t1 truncate max-w-[160px]">
                    {log.admin.email}
                  </td>
                  <td className="px-4 py-3 text-t2 whitespace-nowrap">{timeAgo(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
