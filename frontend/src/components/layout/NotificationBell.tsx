"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { timeAgo } from "@/lib/formatters";
import { useAuthStore } from "@/store/authStore";
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

export function NotificationBell() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: queryKeys.notificationsUnreadCount(),
    queryFn: () => api.get("/notifications/unread-count").then((r) => r.data as { count: number }),
    refetchInterval: 60000,
    enabled: user?.role === "CANDIDATE",
  });

  const { data: listData } = useQuery({
    queryKey: queryKeys.notifications(1),
    queryFn: () =>
      api.get("/notifications?page=1&limit=5").then((r) => r.data as { notifications: Notification[] }),
    enabled: open && user?.role === "CANDIDATE",
    staleTime: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
    },
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (user?.role !== "CANDIDATE") return null;

  const unread = countData?.count ?? 0;
  const notifications = listData?.notifications ?? [];

  function handleNotifClick(noti: Notification) {
    if (!noti.isRead) markReadMutation.mutate(noti.id);
    setOpen(false);
    if (noti.link) router.push(noti.link);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl border border-border-dark hover:bg-white/[.05] transition-colors"
        aria-label="Thông báo"
      >
        <svg className="w-5 h-5 text-t1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-bg-2 border border-border-dark rounded-xl shadow-[0_8px_40px_rgba(0,0,0,.5)] overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border-dark flex items-center justify-between">
            <span className="text-[13px] font-semibold text-t0">Thông báo</span>
            {unread > 0 && (
              <span className="text-[11px] text-[#7C3AED] font-medium">{unread} chưa đọc</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-t2">Chưa có thông báo nào</div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {notifications.map((noti) => (
                <button
                  key={noti.id}
                  onClick={() => handleNotifClick(noti)}
                  className={`w-full text-left px-4 py-3 border-b border-border-dark/50 hover:bg-white/[.04] transition-colors ${
                    !noti.isRead ? "bg-[rgba(124,58,237,.05)]" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5 shrink-0">{TYPE_ICON[noti.type] ?? "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-semibold truncate ${!noti.isRead ? "text-t0" : "text-t1"}`}>
                        {noti.title}
                      </p>
                      <p className="text-[11px] text-t2 line-clamp-2 mt-0.5">{noti.message}</p>
                      <p className="text-[10px] text-t2 mt-1">{timeAgo(noti.createdAt)}</p>
                    </div>
                    {!noti.isRead && (
                      <span className="w-2 h-2 bg-[#7C3AED] rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <Link
            href="/candidate/notifications"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-[12px] font-medium text-[#7C3AED] hover:bg-white/[.04] transition-colors"
          >
            Xem tất cả thông báo →
          </Link>
        </div>
      )}
    </div>
  );
}
