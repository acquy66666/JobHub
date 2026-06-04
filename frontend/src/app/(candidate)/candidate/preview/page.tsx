"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/store/toastStore";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://job-hub-two.vercel.app";

interface CandidateProfile {
  publicSlug?: string | null;
  isPublicProfile?: boolean;
  fullName?: string;
}

export default function PreviewPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [slugInput, setSlugInput] = useState("");
  const [editingSlug, setEditingSlug] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: profile, isLoading } = useQuery<CandidateProfile>({
    queryKey: queryKeys.candidateProfile(),
    queryFn: () => api.get("/candidate/profile").then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (isPublicProfile: boolean) =>
      api.patch("/candidate/profile/public-settings", { isPublicProfile }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() });
      toast.success(profile?.isPublicProfile ? "Đã ẩn hồ sơ" : "Đã công khai hồ sơ");
    },
    onError: () => toast.error("Thao tác thất bại"),
  });

  const slugMutation = useMutation({
    mutationFn: (publicSlug: string) =>
      api.patch("/candidate/profile/public-settings", { publicSlug }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() });
      setEditingSlug(false);
      toast.success("Đã cập nhật slug");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Slug không hợp lệ hoặc đã được sử dụng");
    },
  });

  function copyLink() {
    if (!profile?.publicSlug) return;
    navigator.clipboard.writeText(`${SITE_URL}/u/${profile.publicSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function startEditSlug() {
    setSlugInput(profile?.publicSlug ?? "");
    setEditingSlug(true);
  }

  function saveSlug() {
    const val = slugInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (val.length < 3) { toast.error("Slug phải có ít nhất 3 ký tự"); return; }
    slugMutation.mutate(val);
  }

  const isPublic = profile?.isPublicProfile ?? false;
  const slug = profile?.publicSlug;
  const profileUrl = slug ? `${SITE_URL}/u/${slug}` : null;

  return (
    <div className="p-4 sm:p-8 max-w-2xl space-y-8">
      <ScrollReveal direction="up">
        <h1 className="text-[24px] font-extrabold text-t0 mb-1">Hồ sơ công khai</h1>
        <p className="text-[14px] text-t1">
          Chia sẻ hồ sơ của bạn với nhà tuyển dụng bằng một đường dẫn công khai.
        </p>
      </ScrollReveal>

      {isLoading ? (
        <div className="h-32 rounded-2xl bg-bg-2 border border-border-dark animate-pulse" />
      ) : (
        <>
          {/* Toggle public */}
          <ScrollReveal direction="up" delay={0.05}>
            <div className="card-dark rounded-2xl p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[15px] font-semibold text-t0 mb-0.5">Công khai hồ sơ</p>
                <p className="text-[13px] text-t1">
                  {isPublic ? "Hồ sơ của bạn đang hiển thị công khai" : "Hồ sơ đang ẩn, chỉ bạn mới thấy"}
                </p>
              </div>
              <button
                onClick={() => toggleMutation.mutate(!isPublic)}
                disabled={toggleMutation.isPending}
                className={`relative w-12 h-6 rounded-full transition-colors ${isPublic ? "bg-[#7C3AED]" : "bg-bg-3 border border-border-dark"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isPublic ? "translate-x-6" : "translate-x-0"}`}
                />
              </button>
            </div>
          </ScrollReveal>

          {/* Link & slug */}
          {slug && (
            <ScrollReveal direction="up" delay={0.08}>
              <div className="card-dark rounded-2xl p-6 space-y-4">
                {/* URL */}
                <div>
                  <p className="text-[12px] font-semibold text-t1 uppercase tracking-wide mb-2">Đường dẫn của bạn</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 bg-bg-3 border border-border-dark rounded-xl px-4 py-2.5">
                      <p className="text-[13px] text-t0 truncate">{profileUrl}</p>
                    </div>
                    <button
                      onClick={copyLink}
                      className={`shrink-0 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-colors ${copied ? "border-green-500/40 text-green-400 bg-green-500/10" : "border-border-dark text-t1 hover:border-[rgba(124,58,237,.4)] hover:text-[#B09BF8]"}`}
                    >
                      {copied ? "✓ Đã copy" : "Copy"}
                    </button>
                    {isPublic && (
                      <a
                        href={`/u/${slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 px-4 py-2.5 rounded-xl border border-border-dark text-[13px] text-t1 hover:bg-white/[.04] hover:text-t0 transition-colors"
                      >
                        Xem →
                      </a>
                    )}
                  </div>
                </div>

                {/* Slug edit */}
                <div>
                  <p className="text-[12px] font-semibold text-t1 uppercase tracking-wide mb-2">Slug URL</p>
                  {editingSlug ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-0 bg-bg-3 border border-[rgba(124,58,237,.5)] rounded-xl overflow-hidden focus-within:shadow-[0_0_0_3px_rgba(124,58,237,.1)]">
                        <span className="pl-4 text-[13px] text-t2 shrink-0">/u/</span>
                        <input
                          value={slugInput}
                          onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          placeholder="slug-cua-ban"
                          className="flex-1 bg-transparent px-2 py-2.5 text-[13px] text-t0 focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={saveSlug}
                        disabled={slugMutation.isPending}
                        className="btn-primary px-4 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-60"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditingSlug(false)}
                        className="px-4 py-2.5 rounded-xl border border-border-dark text-[13px] text-t1 hover:bg-white/[.04] transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-bg-3 border border-border-dark rounded-xl px-4 py-2.5">
                        <span className="text-[13px] text-t2">/u/</span>
                        <span className="text-[13px] text-t0 font-medium">{slug}</span>
                      </div>
                      <button
                        onClick={startEditSlug}
                        className="px-4 py-2.5 rounded-xl border border-border-dark text-[13px] text-t1 hover:border-[rgba(124,58,237,.4)] hover:text-[#B09BF8] transition-colors"
                      >
                        Đổi slug
                      </button>
                    </div>
                  )}
                  <p className="text-[11px] text-t2 mt-2">Chỉ dùng chữ thường, số và dấu gạch ngang. Tối thiểu 3 ký tự.</p>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Profile preview card */}
          {isPublic && slug && (
            <ScrollReveal direction="up" delay={0.12}>
              <div className="space-y-3">
                <p className="text-[12px] font-semibold text-t1 uppercase tracking-wide">Xem trước hồ sơ</p>
                <div className="card-dark rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border-dark">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[rgba(239,68,68,.5)]" />
                      <div className="w-3 h-3 rounded-full bg-[rgba(245,158,11,.5)]" />
                      <div className="w-3 h-3 rounded-full bg-[rgba(34,197,94,.5)]" />
                    </div>
                    <p className="text-[11px] text-t2 font-mono truncate max-w-[200px]">{profileUrl}</p>
                    <div />
                  </div>
                  <div className="p-5 text-center">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center text-[24px] font-black text-white mx-auto mb-3">
                      {profile?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-[15px] font-bold text-t0">{profile?.fullName}</p>
                    <p className="text-[12px] text-t2 mt-1 mb-4">Xem toàn bộ hồ sơ →</p>
                    <a
                      href={`/u/${slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[rgba(124,58,237,.12)] border border-[rgba(124,58,237,.2)] text-[13px] text-[#B09BF8] font-medium hover:bg-[rgba(124,58,237,.2)] transition-colors"
                    >
                      Mở trang cá nhân
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Not public yet hint */}
          {!isPublic && (
            <ScrollReveal direction="up" delay={0.1}>
              <div className="card-dark rounded-2xl p-6 border-dashed text-center">
                <div className="text-3xl mb-2">🔒</div>
                <p className="text-[14px] font-semibold text-t0 mb-1">Hồ sơ đang ẩn</p>
                <p className="text-[13px] text-t1">Bật &quot;Công khai hồ sơ&quot; ở trên để tạo đường dẫn chia sẻ.</p>
              </div>
            </ScrollReveal>
          )}
        </>
      )}
    </div>
  );
}
