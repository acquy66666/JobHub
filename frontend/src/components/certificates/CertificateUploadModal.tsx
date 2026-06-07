"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { certificatesApi } from "@/lib/api/certificates";
import CertificateCombobox from "./CertificateCombobox";

export default function CertificateUploadModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [slug, setSlug] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [issuedDate, setIssuedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [score, setScore] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () =>
      certificatesApi.create({
        certificateSlug: slug!,
        file: file!,
        issuedDate: issuedDate ? new Date(issuedDate).toISOString() : undefined,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        score: score || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidate", "certificates"] });
      onClose();
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Có lỗi xảy ra";
      const axiosMsg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(axiosMsg ?? msg);
    },
  });

  function submit() {
    setError(null);
    if (!slug) return setError("Chọn chứng chỉ");
    if (!file) return setError("Tải lên file (PDF/PNG/JPG, ≤5MB)");
    if (file.size > 5 * 1024 * 1024) return setError("File quá lớn (>5MB)");
    mut.mutate();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-2 border border-border-dark rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="cert-upload-title"
      >
        <h2 id="cert-upload-title" className="text-[20px] font-bold text-t0 mb-4">
          📜 Thêm chứng chỉ
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-t1 mb-1.5">Chứng chỉ *</label>
            <CertificateCombobox value={slug} onChange={setSlug} />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-t1 mb-1.5">
              File chứng chỉ * <span className="text-[11px] text-t2 font-normal">(PDF, PNG, JPG, ≤5MB)</span>
            </label>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              data-testid="cert-file-input"
              className="w-full text-[13px] text-t1 file:mr-3 file:px-3 file:py-1.5 file:bg-bg-3 file:border-0 file:rounded-lg file:text-t0 file:text-[12px] file:font-semibold file:cursor-pointer"
            />
            {file && <p className="mt-1 text-[12px] text-t2">{file.name} · {(file.size / 1024).toFixed(0)}KB</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-t1 mb-1.5">Ngày cấp</label>
              <input
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                className="w-full px-3 py-2 bg-bg-3 border border-border-dark rounded-xl text-[13px] text-t0"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-t1 mb-1.5">Ngày hết hạn</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-bg-3 border border-border-dark rounded-xl text-[13px] text-t0"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-t1 mb-1.5">
              Điểm / Cấp độ <span className="text-[11px] text-t2 font-normal">(tuỳ chọn — VD: "IELTS 7.5", "TOEIC 850")</span>
            </label>
            <input
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Để trống nếu không có"
              className="w-full px-3 py-2 bg-bg-3 border border-border-dark rounded-xl text-[13px] text-t0"
            />
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[12px] text-red-300">
              {error}
            </div>
          )}

          <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[12px] text-amber-200">
            ℹ️ Sau khi gửi, admin sẽ duyệt file trong 1-2 ngày. Chứng chỉ chỉ hiển thị trên hồ sơ công khai sau khi duyệt.
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-bg-3 border border-border-dark rounded-xl text-[13px] font-semibold text-t1 hover:text-t0"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={mut.isPending}
            data-testid="cert-submit-btn"
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {mut.isPending ? "Đang gửi..." : "Gửi xét duyệt"}
          </button>
        </div>
      </div>
    </div>
  );
}
