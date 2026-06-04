"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { timeAgo } from "@/lib/formatters";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { Pagination } from "@/components/common/Pagination";
import { useToast } from "@/store/toastStore";
import api from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICON: Record<string, string> = {
  APPLICATION_STATUS_CHANGED: "📋",
  NEW_JOB_FROM_FOLLOWED_COMPANY: "🏢",
  NEW_MATCHED_JOB: "✨",
  JOB_EXPIRING_SOON: "⏰",
  SYSTEM: "🔔",
};

const TYPE_LABEL: Record<string, string> = {
  APPLICATION_STATUS_CHANGED: "Cập nhật đơn",
  NEW_JOB_FROM_FOLLOWED_COMPANY: "Công ty theo dõi",
  NEW_MATCHED_JOB: "Việc phù hợp",
  JOB_EXPIRING_SOON: "Sắp hết hạn",
  SYSTEM: "Hệ thống",
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications(page),
    queryFn: () =>
      api.get(`/notifications?page=${page}&limit=20`).then((r) => r.data as { notifications: Notification[]; total: number; totalPages: number }),
    staleTime: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      toast.success("Đã đánh dấu tất cả đã đọc");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount() });
    },
  });

  const notifications = data?.notifications ?? [];
  const totalPages = data?.totalPages ?? 1;
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="space-y-6">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-t0">Thông báo</h1>
            <p className="text-[13px] text-t2 mt-1">Tất cả thông báo từ hệ thống</p>
          </div>
          {hasUnread && (
            <button
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="text-[13px] font-medium text-[#7C3AED] hover:text-[#9D5CF6] transition-colors"
            >
              {markAllMutation.isPending ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
            </button>
          )}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="bg-bg-2 border border-border-dark rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-border-dark">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/10 rounded w-1/3" />
                      <div className="h-3 bg-white/10 rounded w-2/3" />
                      <div className="h-2 bg-white/10 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">🔔</div>
              <p className="text-[14px] font-medium text-t1">Chưa có thông báo nào</p>
              <p className="text-[12px] text-t2 mt-1">Các cập nhật về đơn ứng tuyển sẽ hiển thị ở đây</p>
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {notifications.map((noti) => (
                <div
                  key={noti.id}
                  className={`px-6 py-4 flex items-start gap-3 group transition-colors ${
                    !noti.isRead ? "bg-[rgba(124,58,237,.04)]" : "hover:bg-white/[.02]"
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{TYPE_ICON[noti.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-semibold tracking-wider text-t2 uppercase">
                        {TYPE_LABEL[noti.type] ?? "Thông báo"}
                      </span>
                      {!noti.isRead && (
                        <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full shrink-0" />
                      )}
                    </div>
                    <p className={`text-[13px] font-semibold ${!noti.isRead ? "text-t0" : "text-t1"}`}>
                      {noti.title}
                    </p>
                    <p className="text-[12px] text-t2 mt-0.5 leading-relaxed">{noti.message}</p>
                    <p className="text-[11px] text-t2 mt-1">{timeAgo(noti.createdAt)}</p>
                    {noti.link && (
                      <a
                        href={noti.link}
                        onClick={() => !noti.isRead && markReadMutation.mutate(noti.id)}
                        className="inline-block mt-1 text-[11px] text-[#7C3AED] hover:underline"
                      >
                        Xem chi tiết →
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!noti.isRead && (
                      <button
                        onClick={() => markReadMutation.mutate(noti.id)}
                        title="Đánh dấu đã đọc"
                        className="p-1.5 rounded-lg hover:bg-white/[.06] text-t2 hover:text-t0 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(noti.id)}
                      title="Xóa"
                      className="p-1.5 rounded-lg hover:bg-white/[.06] text-t2 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>

      {totalPages > 1 && (
        <ScrollReveal delay={150}>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </ScrollReveal>
      )}
    </div>
  );
}
