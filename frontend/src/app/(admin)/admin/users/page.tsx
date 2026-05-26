"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import { timeAgo } from "@/lib/formatters";
import api from "@/lib/api";

interface AdminUser {
  id: string;
  email: string;
  role: "CANDIDATE" | "EMPLOYER" | "ADMIN";
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  candidate: { fullName: string; avatarUrl: string | null } | null;
  employer: { companyName: string; logoUrl: string | null } | null;
}

const ROLE_TABS = [
  { value: "", label: "Tất cả" },
  { value: "CANDIDATE", label: "Ứng viên" },
  { value: "EMPLOYER", label: "Nhà tuyển dụng" },
  { value: "ADMIN", label: "Admin" },
];

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-[rgba(124,58,237,.12)] text-[#B09BF8] border-[rgba(124,58,237,.2)]",
  EMPLOYER: "bg-[rgba(59,130,246,.12)] text-blue-400 border-blue-500/20",
  CANDIDATE: "bg-[rgba(34,197,94,.12)] text-green-400 border-green-500/20",
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  EMPLOYER: "NTD",
  CANDIDATE: "Ứng viên",
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const params = { page, limit: 15, ...(role ? { role } : {}), ...(search ? { keyword: search } : {}) };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminUsers(params),
    queryFn: () => api.get("/admin/users", { params }).then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      api.patch(`/admin/users/${userId}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminUsers() }),
  });

  const users: AdminUser[] = data?.users ?? [];
  const totalPages: number = data?.totalPages ?? 1;

  function handleRoleTab(value: string) {
    setRole(value);
    setPage(1);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(keyword);
    setPage(1);
  }

  function getDisplayName(user: AdminUser) {
    if (user.candidate?.fullName) return user.candidate.fullName;
    if (user.employer?.companyName) return user.employer.companyName;
    return user.email.split("@")[0];
  }

  function getAvatar(user: AdminUser) {
    const url = user.candidate?.avatarUrl ?? user.employer?.logoUrl;
    const initial = getDisplayName(user)[0]?.toUpperCase() ?? "U";
    if (url) return <img src={url} alt="" className="w-8 h-8 rounded-xl object-cover" />;
    return (
      <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-[12px] font-bold text-white shrink-0">
        {initial}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <ScrollReveal direction="up" className="mb-6">
        <h1 className="text-[28px] font-extrabold text-t0 tracking-tight">Quản lý người dùng</h1>
        <p className="text-[15px] text-t1 mt-1">Xem, ban hoặc unban tài khoản người dùng.</p>
      </ScrollReveal>

      {/* Filters */}
      <ScrollReveal direction="up" delay={0.05} className="mb-5 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleRoleTab(tab.value)}
              className={`px-4 py-2 rounded-xl text-[13px] font-medium border transition-colors ${
                role === tab.value
                  ? "bg-[rgba(124,58,237,.15)] border-[rgba(124,58,237,.4)] text-[#B09BF8]"
                  : "bg-transparent border-border-dark text-t1 hover:border-[rgba(124,58,237,.3)] hover:text-t0"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo email..."
            className="bg-bg-2 border border-border-dark rounded-xl px-4 py-2 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] w-52"
          />
          <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-[13px]">Tìm</button>
        </form>
      </ScrollReveal>

      {/* Table */}
      <ScrollReveal direction="up" delay={0.08}>
        <div className="card-dark rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-border-dark">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <div className="w-8 h-8 bg-bg-3 rounded-xl animate-pulse shrink-0" />
                  <div className="h-4 bg-bg-3 rounded animate-pulse flex-1" />
                  <div className="h-4 bg-bg-3 rounded animate-pulse w-20" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[14px] text-t2">Không có người dùng nào.</p>
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {/* Header */}
              <div className="grid grid-cols-[2fr_120px_100px_100px_120px] gap-4 px-5 py-3 text-[11px] font-semibold text-t2 uppercase tracking-wider">
                <span>Người dùng</span>
                <span>Vai trò</span>
                <span>Xác thực</span>
                <span>Trạng thái</span>
                <span>Thao tác</span>
              </div>
              {users.map((user) => (
                <div key={user.id} className="grid grid-cols-[2fr_120px_100px_100px_120px] gap-4 px-5 py-4 items-center hover:bg-white/[.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {getAvatar(user)}
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-t0 truncate">{getDisplayName(user)}</p>
                      <p className="text-[11px] text-t2 truncate">{user.email} · {timeAgo(user.createdAt)}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${ROLE_BADGE[user.role]}`}>
                      {ROLE_LABEL[user.role]}
                    </span>
                  </div>
                  <div>
                    {user.isVerified ? (
                      <span className="text-[11px] text-green-400">✓ Xác thực</span>
                    ) : (
                      <span className="text-[11px] text-t2">Chưa xác thực</span>
                    )}
                  </div>
                  <div>
                    {user.isActive ? (
                      <span className="text-[11px] text-green-400">Hoạt động</span>
                    ) : (
                      <span className="text-[11px] text-red-400">Đã bị ban</span>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => toggleMutation.mutate({ userId: user.id, isActive: !user.isActive })}
                      disabled={toggleMutation.isPending}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors disabled:opacity-50 ${
                        user.isActive
                          ? "bg-[rgba(239,68,68,.12)] text-red-400 border-red-500/20 hover:bg-[rgba(239,68,68,.2)]"
                          : "bg-[rgba(34,197,94,.12)] text-green-400 border-green-500/20 hover:bg-[rgba(34,197,94,.2)]"
                      }`}
                    >
                      {user.isActive ? "Ban" : "Unban"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
