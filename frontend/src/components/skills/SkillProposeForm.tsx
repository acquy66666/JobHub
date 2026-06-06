"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { skillProposalsApi, type SkillProposal } from "@/lib/api/skill-proposals";
import { CATEGORY_LABEL, CATEGORY_ORDER, type SkillCategory } from "@/lib/api/skills";

const STATUS_BADGE: Record<SkillProposal["status"], { text: string; cls: string }> = {
  PENDING: { text: "Đang chờ duyệt", cls: "bg-[rgba(245,158,11,.12)] text-[#FCD34D] border-[rgba(245,158,11,.2)]" },
  APPROVED: { text: "Đã duyệt", cls: "bg-[rgba(34,197,94,.12)] text-[#4ADE80] border-[rgba(34,197,94,.2)]" },
  REJECTED: { text: "Từ chối", cls: "bg-[rgba(239,68,68,.12)] text-[#F87171] border-[rgba(239,68,68,.2)]" },
};

export default function SkillProposeForm({ roleLabel }: { roleLabel: "Ứng viên" | "Nhà tuyển dụng" }) {
  const sp = useSearchParams();
  const prefillQ = sp.get("q") ?? "";
  const [name, setName] = useState(prefillQ);
  const [nameEn, setNameEn] = useState("");
  const [category, setCategory] = useState<SkillCategory>("IT");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const qc = useQueryClient();

  useEffect(() => { if (prefillQ && !name) setName(prefillQ); }, [prefillQ, name]);

  const { data: mine, isLoading } = useQuery({
    queryKey: ["skill-proposals", "mine"],
    queryFn: () => skillProposalsApi.listMine(),
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: () => skillProposalsApi.create({ name: name.trim(), nameEn: nameEn.trim() || undefined, category, reason: reason.trim() || undefined }),
    onSuccess: () => {
      setSuccess("Đã gửi đề xuất. Admin sẽ duyệt sớm.");
      setError(null);
      setName(""); setNameEn(""); setReason("");
      qc.invalidateQueries({ queryKey: ["skill-proposals", "mine"] });
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      setError(e.response?.data?.message ?? "Có lỗi xảy ra");
      setSuccess(null);
    },
  });

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-t0">💡 Đề xuất kỹ năng mới</h1>
        <p className="text-t1 text-[13px] mt-1">
          {roleLabel === "Ứng viên"
            ? "Không tìm thấy kỹ năng của bạn trong ngân hàng? Gửi đề xuất để admin duyệt và thêm vào hệ thống."
            : "Đề xuất bổ sung kỹ năng vào ngân hàng để tin tuyển dụng của bạn phong phú hơn."}
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (!mutation.isPending && name.trim().length >= 2) mutation.mutate(); }}
        className="bg-bg-2 border border-border-dark rounded-2xl p-6 space-y-4"
      >
        <div>
          <label className="block text-[12px] text-t1 mb-1.5">Tên kỹ năng <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Figma, ReactJS, Quản lý dự án..."
            className="w-full bg-[#13131E] border border-[#252538] rounded-xl px-4 py-2.5 text-[14px] text-t0 placeholder:text-[#55556A] focus:outline-none focus:border-[rgba(124,58,237,.5)]"
            required
            minLength={2}
            maxLength={80}
          />
        </div>

        <div>
          <label className="block text-[12px] text-t1 mb-1.5">Tên tiếng Anh (nếu có)</label>
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="VD: Figma, Project Management..."
            className="w-full bg-[#13131E] border border-[#252538] rounded-xl px-4 py-2.5 text-[14px] text-t0 placeholder:text-[#55556A] focus:outline-none focus:border-[rgba(124,58,237,.5)]"
            maxLength={80}
          />
        </div>

        <div>
          <label className="block text-[12px] text-t1 mb-1.5">Danh mục <span className="text-red-400">*</span></label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SkillCategory)}
            className="w-full bg-[#13131E] border border-[#252538] rounded-xl px-4 py-2.5 text-[14px] text-t0 focus:outline-none focus:border-[rgba(124,58,237,.5)]"
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] text-t1 mb-1.5">Lý do / mô tả thêm</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Giúp admin hiểu vì sao nên thêm kỹ năng này (tùy chọn)..."
            rows={3}
            maxLength={500}
            className="w-full bg-[#13131E] border border-[#252538] rounded-xl px-4 py-2.5 text-[14px] text-t0 placeholder:text-[#55556A] focus:outline-none focus:border-[rgba(124,58,237,.5)] resize-none"
          />
        </div>

        {error && <div className="p-3 rounded-xl bg-[rgba(239,68,68,.08)] border border-[rgba(239,68,68,.2)] text-[13px] text-[#F87171]">{error}</div>}
        {success && <div className="p-3 rounded-xl bg-[rgba(34,197,94,.08)] border border-[rgba(34,197,94,.2)] text-[13px] text-[#4ADE80]">{success}</div>}

        <button
          type="submit"
          disabled={mutation.isPending || name.trim().length < 2}
          className="px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Đang gửi..." : "Gửi đề xuất"}
        </button>
      </form>

      <div className="bg-bg-2 border border-border-dark rounded-2xl p-6">
        <h2 className="text-[16px] font-bold text-t0 mb-4">Đề xuất của tôi</h2>
        {isLoading && <p className="text-t1 text-[13px]">Đang tải...</p>}
        {!isLoading && (!mine || mine.length === 0) && (
          <p className="text-t2 text-[13px]">Chưa có đề xuất nào.</p>
        )}
        {!isLoading && mine && mine.length > 0 && (
          <ul className="space-y-3">
            {mine.map((p) => {
              const badge = STATUS_BADGE[p.status];
              return (
                <li key={p.id} className="border border-border-dark rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-t0">{p.name}{p.nameEn ? <span className="text-t2 font-normal"> · {p.nameEn}</span> : null}</p>
                      <p className="text-[12px] text-t1 mt-0.5">{CATEGORY_LABEL[p.category]} · {new Date(p.createdAt).toLocaleString("vi-VN")}</p>
                      {p.reason && <p className="text-[12px] text-t1 mt-1">📝 {p.reason}</p>}
                      {p.adminNote && <p className="text-[12px] text-[#B09BF8] mt-1">💬 Admin: {p.adminNote}</p>}
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.cls}`}>{badge.text}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
