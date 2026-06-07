"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { certificatesApi, CERT_STATUS_LABEL, type CandidateCertificate } from "@/lib/api/certificates";
import CertificateUploadModal from "./CertificateUploadModal";

const STATUS_STYLE: Record<CandidateCertificate["status"], string> = {
  PENDING: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  APPROVED: "bg-green-500/15 text-green-300 border border-green-500/30",
  REJECTED: "bg-red-500/15 text-red-300 border border-red-500/30",
};

export default function CertificatesSection() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: certs = [], isLoading } = useQuery({
    queryKey: ["candidate", "certificates"],
    queryFn: () => certificatesApi.listMine(),
    staleTime: 30 * 1000,
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => certificatesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate", "certificates"] }),
  });

  return (
    <section
      data-testid="certificates-section"
      className="bg-bg-2 border border-border-dark rounded-2xl p-5 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[18px] font-bold text-t0">📜 Chứng chỉ</h2>
          <p className="text-[12px] text-t2 mt-0.5">
            Chứng chỉ giúp hồ sơ tăng tính cạnh tranh. Cần admin duyệt trước khi hiển thị công khai.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          data-testid="cert-add-btn"
          className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[13px] font-semibold rounded-xl hover:opacity-90"
        >
          + Thêm
        </button>
      </div>

      {isLoading ? (
        <div className="text-[13px] text-t2">Đang tải...</div>
      ) : certs.length === 0 ? (
        <div className="text-center py-8 text-[13px] text-t2">
          Chưa có chứng chỉ nào.
        </div>
      ) : (
        <ul className="space-y-3">
          {certs.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-3 p-3 bg-bg-3 border border-border-dark rounded-xl"
              data-testid={`cert-row-${c.status.toLowerCase()}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-t0 text-[14px]">{c.certificate.nameVi}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[c.status]}`}>
                    {CERT_STATUS_LABEL[c.status]}
                  </span>
                </div>
                <p className="text-[12px] text-t2 mt-0.5">{c.certificate.issuer}</p>
                {c.score && <p className="text-[12px] text-t1 mt-1">Điểm: <span className="font-semibold">{c.score}</span></p>}
                <div className="text-[11px] text-t2 mt-1 flex gap-3 flex-wrap">
                  {c.issuedDate && <span>Cấp: {new Date(c.issuedDate).toLocaleDateString("vi-VN")}</span>}
                  {c.expiryDate && <span>Hết hạn: {new Date(c.expiryDate).toLocaleDateString("vi-VN")}</span>}
                  <a href={c.fileUrl} target="_blank" rel="noreferrer" className="text-purple-300 hover:text-purple-200 underline">
                    📎 {c.fileName}
                  </a>
                </div>
                {c.status === "REJECTED" && c.adminNote && (
                  <p className="text-[11px] text-red-300 mt-1.5">Lý do: {c.adminNote}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Xoá "${c.certificate.nameVi}"?`)) removeMut.mutate(c.id);
                }}
                disabled={removeMut.isPending}
                aria-label={`Xoá ${c.certificate.nameVi}`}
                className="text-t2 hover:text-red-400 text-sm"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {showModal && <CertificateUploadModal onClose={() => setShowModal(false)} />}
    </section>
  );
}
