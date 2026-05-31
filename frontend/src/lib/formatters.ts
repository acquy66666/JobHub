export function formatSalary(min?: number | null, max?: number | null, currency = 'VND'): string {
  if (!min && !max) return 'Thỏa thuận';
  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}tr`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
    return String(n);
  };
  if (min && max) return `${fmt(min)} - ${fmt(max)} ${currency}`;
  if (min) return `Từ ${fmt(min)} ${currency}`;
  return `Đến ${fmt(max!)} ${currency}`;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
  FREELANCE: 'Freelance',
};

export function formatJobType(type: string): string {
  return JOB_TYPE_LABELS[type] ?? type;
}

const WORK_MODE_LABELS: Record<string, string> = {
  ON_SITE: 'Tại văn phòng',
  REMOTE: 'Làm từ xa',
  HYBRID: 'Kết hợp',
};

export function formatWorkMode(mode: string): string {
  return WORK_MODE_LABELS[mode] ?? mode;
}

const APPLICATION_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xét duyệt', color: 'bg-[rgba(245,158,11,.12)] text-yellow-400 border-yellow-500/20' },
  REVIEWING: { label: 'Đang xem xét', color: 'bg-[rgba(59,130,246,.12)] text-blue-400 border-blue-500/20' },
  ACCEPTED: { label: 'Đã chấp nhận', color: 'bg-[rgba(34,197,94,.12)] text-green-400 border-green-500/20' },
  REJECTED: { label: 'Bị từ chối', color: 'bg-[rgba(239,68,68,.12)] text-red-400 border-red-500/20' },
};

export function formatApplicationStatus(status: string): { label: string; color: string } {
  return APPLICATION_STATUS[status] ?? { label: status, color: 'bg-bg-3 text-t1 border-border-dark' };
}

const JOB_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-[rgba(245,158,11,.12)] text-yellow-400 border-yellow-500/20' },
  ACTIVE: { label: 'Đang tuyển', color: 'bg-[rgba(34,197,94,.12)] text-green-400 border-green-500/20' },
  PAUSED: { label: 'Tạm dừng', color: 'bg-bg-3 text-t1 border-border-dark' },
  EXPIRED: { label: 'Hết hạn', color: 'bg-bg-3 text-t2 border-border-dark' },
  REJECTED: { label: 'Bị từ chối', color: 'bg-[rgba(239,68,68,.12)] text-red-400 border-red-500/20' },
};

export function formatJobStatus(status: string): { label: string; color: string } {
  return JOB_STATUS[status] ?? { label: status, color: 'bg-bg-3 text-t1 border-border-dark' };
}

const APPLICATION_TAG: Record<string, { label: string; color: string; icon: string }> = {
  SHORTLISTED: { label: 'Tiềm năng cao', color: 'bg-[rgba(34,197,94,.12)] text-green-400 border-green-500/30', icon: '⭐' },
  ON_HOLD:     { label: 'Tạm giữ',       color: 'bg-[rgba(245,158,11,.12)] text-yellow-400 border-yellow-500/30', icon: '⏸' },
  POTENTIAL:   { label: 'Tiềm năng',     color: 'bg-[rgba(59,130,246,.12)] text-blue-400 border-blue-500/30', icon: '💡' },
};

export function formatApplicationTag(tag?: string | null): { label: string; color: string; icon: string } | null {
  if (!tag) return null;
  return APPLICATION_TAG[tag] ?? null;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}
