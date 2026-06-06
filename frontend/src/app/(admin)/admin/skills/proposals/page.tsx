"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { skillProposalsApi, type SkillProposalStatus, type SkillProposal } from "@/lib/api/skill-proposals";
import { CATEGORY_LABEL } from "@/lib/api/skills";

const TABS: { value: SkillProposalStatus | "ALL"; label: string }[] = [
  { value: "PENDING", label: "Đang chờ" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "ALL", label: "Tất cả" },
];

export default function AdminProposalsPage() {
  const [tab, setTab] = useState<SkillProposalStatus | "ALL">("PENDING");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ type: "approve" | "reject"; proposal: SkillProposal } | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["skill-proposals", "admin", tab, page],
    queryFn: () => skillProposalsApi.listAdmin({ status: tab === "ALL" ? undefined : tab, page, limit: 20 }),
    staleTime: 15_000,
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => skillProposalsApi.approve(id, adminNote.trim() || undefined),
    onSuccess: () => { setModal(null); setAdminNote(""); setError(null); qc.invalidateQueries({ queryKey: ["skill-proposals", "admin"] }); },
    onError: (e: { response?: { data?: { message?: string } } }) => setError(e.response?.data?.message ?? "Lỗi"),
  });
  const rejectMut = useMutation({
    mutationFn: (id: string) => skillProposalsApi.reject(id, adminNote.trim()),
    onSuccess: () => { setModal(null); setAdminNote(""); setError(null); qc.invalidateQueries({ queryKey: ["skill-proposals", "admin"] }); },
    onError: (e: { response?: { data?: { message?: string } } }) => setError(e.response?.data?.message ?? "Lỗi"),
  });

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-t0">💡 Đề xuất kỹ năng</h1>
        <p className="text-t1 text-[13px] mt-1">Duyệt đề xuất từ candidate / employer. Approve sẽ tự động thêm Skill vào ngân hàng.</p>
      </div>

      <div className="flex gap-2 border-b border-border-dark overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setPage(1); }}
            className={`px-4 py-2 text-[13px] font-medium whitespace-nowrap border-b-2 transition ${
              tab === t.value ? "border-primary text-t0" : "border-transparent text-t1 hover:text-t0"
            }`}
          >{t.label}</button>
        ))}
      </div>

      <div className="bg-bg-2 border border-border-dark rounded-2xl overflow-hidden">
        {isLoading && <div className="p-6 text-t1">Đang tải...</div>}
        {!isLoading && data && data.items.length === 0 && (
          <div className="p-8 text-center text-t1 text-[13px]">Không có đề xuất nào.</div>
        )}
        {!isLoading && data && data.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-bg-1 text-t1 text-[11px] uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Người đề xuất</th>
                  <th className="text-left px-4 py-3">Tên kỹ năng</th>
                  <th className="text-left px-4 py-3">Danh mục</th>
                  <th className="text-left px-4 py-3">Lý do</th>
                  <th className="text-left px-4 py-3">Trạng thái</th>
                  <th className="text-right px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.id} className="border-t border-border-dark">
                    <td className="px-4 py-3 text-t0">
                      <div>{p.proposer?.email ?? p.proposedById}</div>
                      <div className="text-[11px] text-t2">{p.proposedByRole}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-t0 font-medium">{p.name}</div>
                      {p.nameEn && <div className="text-[11px] text-t2">{p.nameEn}</div>}
                    </td>
                    <td className="px-4 py-3 text-t1">{CATEGORY_LABEL[p.category]}</td>
                    <td className="px-4 py-3 text-t1 max-w-[280px] truncate" title={p.reason ?? ""}>{p.reason ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] border ${
                        p.status === "PENDING" ? "bg-[rgba(245,158,11,.12)] text-[#FCD34D] border-[rgba(245,158,11,.2)]" :
                        p.status === "APPROVED" ? "bg-[rgba(34,197,94,.12)] text-[#4ADE80] border-[rgba(34,197,94,.2)]" :
                        "bg-[rgba(239,68,68,.12)] text-[#F87171] border-[rgba(239,68,68,.2)]"
                      }`}>{p.status}</span>
                      {p.adminNote && <div className="text-[11px] text-t2 mt-1">💬 {p.adminNote}</div>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status === "PENDING" ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => { setModal({ type: "approve", proposal: p }); setAdminNote(""); setError(null); }}
                            className="px-3 py-1.5 rounded-lg bg-[rgba(34,197,94,.12)] text-[#4ADE80] border border-[rgba(34,197,94,.2)] text-[12px] font-semibold hover:bg-[rgba(34,197,94,.18)]"
                          >Duyệt</button>
                          <button
                            onClick={() => { setModal({ type: "reject", proposal: p }); setAdminNote(""); setError(null); }}
                            className="px-3 py-1.5 rounded-lg bg-[rgba(239,68,68,.12)] text-[#F87171] border border-[rgba(239,68,68,.2)] text-[12px] font-semibold hover:bg-[rgba(239,68,68,.18)]"
                          >Từ chối</button>
                        </div>
                      ) : (
                        <span className="text-t2 text-[12px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-border-dark text-[12px] text-t1">
            <span>Trang {data.page} / {data.totalPages} · {data.total} đề xuất</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg border border-border-dark text-t1 disabled:opacity-40">‹</button>
              <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg border border-border-dark text-t1 disabled:opacity-40">›</button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-bg-2 border border-border-dark rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[18px] font-bold text-t0 mb-2">
              {modal.type === "approve" ? "Duyệt đề xuất?" : "Từ chối đề xuất?"}
            </h3>
            <p className="text-t1 text-[13px] mb-4">
              Kỹ năng: <span className="text-t0 font-semibold">{modal.proposal.name}</span> · {CATEGORY_LABEL[modal.proposal.category]}
              {modal.type === "approve" && <span className="block text-[12px] mt-1 text-[#4ADE80]">→ Sẽ tự động thêm vào ngân hàng + thông báo cho người đề xuất.</span>}
            </p>
            <label className="block text-[12px] text-t1 mb-1.5">
              Ghi chú admin {modal.type === "reject" && <span className="text-red-400">*</span>}
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={modal.type === "reject" ? "Lý do từ chối (bắt buộc)..." : "Ghi chú tùy chọn..."}
              className="w-full bg-[#13131E] border border-[#252538] rounded-xl px-3 py-2 text-[13px] text-t0 focus:outline-none focus:border-[rgba(124,58,237,.5)] resize-none"
            />
            {error && <div className="mt-2 text-[12px] text-[#F87171]">{error}</div>}
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-border-dark text-t1 text-[13px]">Hủy</button>
              <button
                onClick={() => {
                  if (modal.type === "approve") approveMut.mutate(modal.proposal.id);
                  else { if (!adminNote.trim()) { setError("Cần ghi lý do từ chối"); return; } rejectMut.mutate(modal.proposal.id); }
                }}
                disabled={approveMut.isPending || rejectMut.isPending}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50 ${
                  modal.type === "approve" ? "bg-[#16A34A]" : "bg-[#DC2626]"
                }`}
              >
                {(approveMut.isPending || rejectMut.isPending) ? "Đang xử lý..." : modal.type === "approve" ? "Duyệt" : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
