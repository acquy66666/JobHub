"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import { timeAgo } from "@/lib/formatters";
import { useToast } from "@/store/toastStore";
import api from "@/lib/api";
import { HairlineSection } from "@/components/ui/HairlineSection";
import { MonoNumber } from "@/components/ui/MonoNumber";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_LABEL: Record<string, string> = {
  APPLICATION_STATUS_CHANGED: "đơn",
  NEW_JOB_FROM_FOLLOWED_COMPANY: "công ty",
  NEW_MATCHED_JOB: "phù hợp",
  INTERVIEW_SCHEDULED: "phỏng vấn",
  JOB_EXPIRING_SOON: "hết hạn",
  SYSTEM: "hệ thống",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "tất cả" },
  { value: "APPLICATION_STATUS_CHANGED", label: "đơn" },
  { value: "NEW_JOB_FROM_FOLLOWED_COMPANY", label: "công ty theo dõi" },
  { value: "NEW_MATCHED_JOB", label: "phù hợp" },
  { value: "INTERVIEW_SCHEDULED", label: "phỏng vấn" },
];

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications(page),
    queryFn: () =>
      api
        .get(`/notifications?page=${page}&limit=20`)
        .then((r) => r.data as { notifications: Notification[]; total: number; totalPages: number }),
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
  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);

  return (
    <div className="pb-10">
      <section className="px-4 md:px-6 py-8 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[clamp(26px,3.5vw,36px)] font-medium tracking-tight text-[var(--t0)]">
            Thông báo
          </h1>
          <p className="font-mono text-[13px] text-[var(--t1)] mt-2">
            {`> ${notifications.length} thông báo${hasUnread ? " · có chưa đọc" : ""}`}
          </p>
        </div>
        {hasUnread && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="font-mono text-[13px] text-[var(--accent)] hover:underline disabled:opacity-50"
          >
            → đánh dấu tất cả đã đọc
          </button>
        )}
      </section>

      <div
        role="tablist"
        aria-label="Lọc thông báo"
        className="px-4 md:px-6 pb-4 flex gap-x-5 gap-y-2 flex-wrap font-mono text-[13px]"
      >
        {FILTERS.map((t) => {
          const active = filter === t.value;
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(t.value)}
              className={`transition-colors ${
                active
                  ? "text-[var(--accent)]"
                  : "text-[var(--t1)] hover:text-[var(--t0)]"
              }`}
            >
              {active ? `[${t.label}]` : t.label}
            </button>
          );
        })}
      </div>

      <HairlineSection label="DANH SÁCH">
        {isLoading ? (
          <p className="px-4 md:px-6 py-8 font-mono text-[13px] text-[var(--t2)]">đang tải…</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 md:px-6 py-10 text-center font-mono text-[13px] text-[var(--t2)]">
            {notifications.length === 0
              ? "Chưa có thông báo nào."
              : "Không có thông báo nào ở mục này."}
          </p>
        ) : (
          filtered.map((noti, i) => {
            const idx = String((page - 1) * 20 + i + 1).padStart(2, "0");
            return (
              <div
                key={noti.id}
                className={`group border-b border-[var(--border)] border-l-2 ${
                  !noti.isRead ? "border-l-[var(--accent)] bg-[var(--accent-dim)]" : "border-l-transparent"
                }`}
              >
                <div className="grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_auto] items-center gap-4 px-4 md:px-6 py-4">
                  <div className="flex items-center">
                    <MonoNumber size="lg" tone={!noti.isRead ? "accent" : "muted"}>{idx}</MonoNumber>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 font-mono text-[11px] uppercase tracking-wider text-[var(--t2)]">
                      <span>{TYPE_LABEL[noti.type] ?? "thông báo"}</span>
                      <span className="text-[var(--t2)]">·</span>
                      <span className="tabular-nums">{timeAgo(noti.createdAt)}</span>
                    </div>
                    <p className={`text-[14px] font-semibold truncate ${!noti.isRead ? "text-[var(--t0)]" : "text-[var(--t1)]"}`}>
                      {noti.title}
                    </p>
                    <p className="text-[13px] text-[var(--t1)] mt-0.5 line-clamp-2 leading-relaxed">
                      {noti.message}
                    </p>
                    {noti.link && (
                      <a
                        href={noti.link}
                        onClick={() => !noti.isRead && markReadMutation.mutate(noti.id)}
                        className="inline-block mt-1 font-mono text-[12px] text-[var(--accent)] hover:underline"
                      >
                        → xem chi tiết
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!noti.isRead && (
                      <button
                        onClick={() => markReadMutation.mutate(noti.id)}
                        title="đánh dấu đã đọc"
                        className="p-1.5 text-[var(--t2)] hover:text-[var(--t0)] transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(noti.id)}
                      title="xoá"
                      className="p-1.5 text-[var(--t2)] hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </HairlineSection>

      {totalPages > 1 && (
        <div className="px-4 md:px-6 py-6 flex items-center justify-between font-mono text-[13px] border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 text-[var(--t1)] hover:text-[var(--t0)] disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> prev
          </button>
          <span className="text-[var(--t2)] tabular-nums">page {page}/{totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 text-[var(--t1)] hover:text-[var(--t0)] disabled:opacity-30"
          >
            next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
