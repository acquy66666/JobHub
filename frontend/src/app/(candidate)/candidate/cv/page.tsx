"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";
import { useRef, useState } from "react";
import { useToast } from "@/store/toastStore";

interface CandidateCV {
  id: string;
  fileName: string;
  fileUrl: string;
  isDefault: boolean;
  createdAt: string;
}

export default function CandidateCVPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const { data: cvs = [], isLoading } = useQuery<CandidateCV[]>({
    queryKey: queryKeys.candidateCvs(),
    queryFn: () => api.get("/candidate/cvs").then((r) => r.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("cv", file);
      return api.post("/candidate/cvs", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.candidateCvs() });
      qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() });
      setProgress(0);
      setUploadError("");
      toast.success("Upload CV thành công!");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setUploadError(msg ?? "Upload thất bại. Thử lại.");
      setProgress(0);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (cvId: string) => api.patch(`/candidate/cvs/${cvId}/default`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.candidateCvs() });
      qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() });
      toast.success("Đã đặt CV mặc định");
    },
    onError: () => toast.error("Đặt mặc định thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (cvId: string) => api.delete(`/candidate/cvs/${cvId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.candidateCvs() });
      qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() });
      toast.success("Đã xóa CV");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Xóa thất bại");
    },
  });

  function handleFile(file: File) {
    setUploadError("");
    if (file.type !== "application/pdf") { setUploadError("Chỉ chấp nhận file PDF"); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError("File tối đa 5MB"); return; }
    uploadMutation.mutate(file);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl space-y-8">
      <ScrollReveal direction="up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-extrabold text-t0 mb-1">Quản lý CV</h1>
            <p className="text-[14px] text-t1">
              Tải lên nhiều CV cho từng vị trí khác nhau. Tối đa 5MB / file PDF.
            </p>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-primary px-5 py-2.5 rounded-xl text-[14px] font-semibold"
          >
            + Tải CV lên
          </button>
        </div>
      </ScrollReveal>

      {/* CV List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-bg-2 border border-border-dark animate-pulse" />
          ))}
        </div>
      ) : cvs.length > 0 ? (
        <ScrollReveal direction="up" delay={0.05}>
          <div className="space-y-3">
            {cvs.map((cv, i) => (
              <div
                key={cv.id}
                className="card-dark p-5 rounded-2xl flex items-center justify-between gap-4 transition-all hover:border-[rgba(124,58,237,.3)]"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-[rgba(239,68,68,.1)] flex items-center justify-center text-[20px]">
                    📄
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-semibold text-t0 truncate">{cv.fileName}</p>
                      {cv.isDefault && (
                        <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(124,58,237,.15)] text-[#B09BF8] border border-[rgba(124,58,237,.25)]">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-t2 mt-0.5">Tải lên {formatDate(cv.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={cv.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-border-dark text-[12px] text-t1 hover:bg-white/[.04] hover:text-t0 transition-colors"
                  >
                    Xem
                  </a>
                  {!cv.isDefault && (
                    <button
                      onClick={() => setDefaultMutation.mutate(cv.id)}
                      disabled={setDefaultMutation.isPending}
                      className="px-3 py-1.5 rounded-lg border border-border-dark text-[12px] text-t1 hover:border-[rgba(124,58,237,.4)] hover:text-[#B09BF8] transition-colors disabled:opacity-50"
                    >
                      Đặt mặc định
                    </button>
                  )}
                  {cvs.length > 1 && (
                    <button
                      onClick={() => deleteMutation.mutate(cv.id)}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-1.5 rounded-lg border border-[rgba(239,68,68,.2)] text-[12px] text-red-400 hover:bg-[rgba(239,68,68,.06)] transition-colors disabled:opacity-50"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      ) : (
        <ScrollReveal direction="up" delay={0.05}>
          <div className="card-dark p-10 rounded-2xl text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-[15px] font-semibold text-t0 mb-1">Chưa có CV nào</p>
            <p className="text-[13px] text-t2">Tải lên CV đầu tiên của bạn để bắt đầu ứng tuyển</p>
          </div>
        </ScrollReveal>
      )}

      {/* Drop zone */}
      <ScrollReveal direction="up" delay={0.1}>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-[rgba(124,58,237,.08)]"
              : "border-border-dark hover:border-[rgba(124,58,237,.4)] hover:bg-[rgba(124,58,237,.03)]"
          }`}
        >
          <div className="text-4xl mb-3">📁</div>
          <p className="text-[14px] font-semibold text-t0 mb-1">Kéo thả hoặc nhấn để tải CV mới</p>
          <p className="text-[12px] text-t2">PDF · Tối đa 5MB</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />
      </ScrollReveal>

      {/* Upload progress */}
      {uploadMutation.isPending && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-t1">Đang upload...</span>
            <span className="text-primary font-semibold">{progress}%</span>
          </div>
          <div className="h-2 bg-bg-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gradient rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {uploadError && <p className="text-[13px] text-red-400">{uploadError}</p>}
    </div>
  );
}
