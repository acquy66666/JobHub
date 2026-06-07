"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminCertificatesApi,
  CERT_STATUS_LABEL,
  type AdminCandidateCertificate,
  type CandidateCertificateStatus,
} from "@/lib/api/certificates";

const TABS: Array<{ value: CandidateCertificateStatus | "ALL"; label: string }> = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Bị từ chối" },
  { value: "ALL", label: "Tất cả" },
];

const STATUS_STYLE: Record<CandidateCertificateStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  APPROVED: "bg-green-500/15 text-green-300 border border-green-500/30",
  REJECTED: "bg-red-500/15 text-red-300 border border-red-500/30",
};

export default function AdminCertificatesPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<CandidateCertificateStatus | "ALL">("PENDING");
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<AdminCandidateCertificate | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "certificates", tab, page],
    queryFn: () => adminCertificatesApi.list(tab, page, 20),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => adminCertificatesApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "certificates"] }),
  });

  const rejectMut = useMutation({
    mutationFn: (vars: { id: string; note: string }) => adminCertificatesApi.reject(vars.id, vars.note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "certificates"] });
      setRejectTarget(null);
      setRejectNote("");
    },
  });

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <h1 className="text-[clamp(24px,3vw,32px)] font-extrabold text-t0 tracking-tight mb-1">📜 Duyệt chứng chỉ</h1>
      <p className="text-[13px] text-t2 mb-6">Kiểm tra file chứng chỉ candidate đã tải lên — duyệt hoặc từ chối kèm lý do.</p>

      <div role="tablist" className="flex gap-2 mb-4 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => {
              setTab(t.value);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap border ${
              tab === t.value
                ? "bg-[rgba(124,58,237,.18)] border-[rgba(124,58,237,.5)] text-t0"
                : "bg-bg-2 border-border-dark text-t1 hover:text-t0"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-[13px] text-t2 p-4">Đang tải...</div>
      ) : (data?.items ?? []).length === 0 ? (
        <div className="card-dark p-8 rounded-2xl text-center text-[13px] text-t2">Không có chứng chỉ nào.</div>
      ) : (
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" data-testid="cert-admin-table">
              <thead className="bg-bg-1 text-t2 text-[12px]">
                <tr>
                  <th className="text-left px-4 py-3">Candidate</th>
                  <th className="text-left px-4 py-3">Chứng chỉ</th>
                  <th className="text-left px-4 py-3">File</th>
                  <th className="text-left px-4 py-3">Điểm</th>
                  <th className="text-left px-4 py-3">Ngày gửi</th>
                  <th className="text-left px-4 py-3">Trạng thái</th>
                  <th className="text-right px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {(data?.items ?? []).map((it) => (
                  <tr key={it.id} className="hover:bg-bg-3/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-t0">{it.candidate.fullName}</div>
                      <div className="text-[11px] text-t2">{it.candidate.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-t0">{it.certificate.nameVi}</div>
                      <div className="text-[11px] text-t2">{it.certificate.issuer}</div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={it.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-300 hover:text-purple-200 underline text-[12px]"
                      >
                        📎 Mở
                      </a>
                    </td>
                    <td className="px-4 py-3 text-t1">{it.score ?? "—"}</td>
                    <td className="px-4 py-3 text-t2 text-[12px]">
                      {new Date(it.uploadedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[it.status]}`}>
                        {CERT_STATUS_LABEL[it.status]}
                      </span>
                      {it.status === "REJECTED" && it.adminNote && (
                        <div className="text-[11px] text-red-300 mt-1">{it.adminNote}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {it.status === "PENDING" ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => approveMut.mutate(it.id)}
                            disabled={approveMut.isPending}
                            className="px-3 py-1 rounded-lg bg-green-500/15 border border-green-500/30 text-green-300 text-[12px] font-semibold hover:bg-green-500/25"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => {
                              setRejectTarget(it);
                              setRejectNote("");
                            }}
                            className="px-3 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-[12px] font-semibold hover:bg-red-500/25"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-t2">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-[12px] font-semibold ${p === page ? "bg-brand-gradient text-white" : "bg-bg-2 text-t1 hover:text-t0"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setRejectTarget(null)}
        >
          <div
            className="bg-bg-2 border border-border-dark rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <h2 className="text-[18px] font-bold text-t0 mb-2">Từ chối chứng chỉ</h2>
            <p className="text-[12px] text-t2 mb-4">
              {rejectTarget.candidate.fullName} · {rejectTarget.certificate.nameVi}
            </p>
            <label className="block text-[13px] font-semibold text-t1 mb-1.5">Lý do từ chối *</label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="VD: File bị mờ, không đọc được số / Không phải chứng chỉ thật / Hết hạn..."
              className="w-full px-3 py-2 bg-bg-3 border border-border-dark rounded-xl text-[13px] text-t0 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 px-4 py-2 bg-bg-3 border border-border-dark rounded-xl text-[13px] font-semibold text-t1"
              >
                Huỷ
              </button>
              <button
                onClick={() => {
                  if (!rejectNote.trim()) return;
                  rejectMut.mutate({ id: rejectTarget.id, note: rejectNote.trim() });
                }}
                disabled={rejectMut.isPending || !rejectNote.trim()}
                className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl text-[13px] font-semibold text-red-300 hover:bg-red-500/30 disabled:opacity-50"
              >
                {rejectMut.isPending ? "Đang gửi..." : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
