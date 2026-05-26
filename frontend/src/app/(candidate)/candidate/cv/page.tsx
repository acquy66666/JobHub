"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";
import { useRef, useState } from "react";

export default function CandidateCVPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const { data: profile } = useQuery({
    queryKey: queryKeys.candidateProfile(),
    queryFn: () => api.get("/candidate/profile").then((r) => r.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("cv", file);
      return api.post("/candidate/cv", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() });
      setProgress(0);
      setError("");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Upload thất bại. Thử lại.");
      setProgress(0);
    },
  });

  function handleFile(file: File) {
    setError("");
    if (file.type !== "application/pdf") { setError("Chỉ chấp nhận file PDF"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("File tối đa 5MB"); return; }
    uploadMutation.mutate(file);
  }

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <ScrollReveal direction="up">
        <h1 className="text-[24px] font-extrabold text-t0 mb-1">Upload CV</h1>
        <p className="text-[14px] text-t1">Tải lên CV của bạn để ứng tuyển nhanh hơn. Chỉ chấp nhận PDF, tối đa 5MB.</p>
      </ScrollReveal>

      {/* Current CV */}
      {profile?.cvUrl && (
        <ScrollReveal direction="up" delay={0.05}>
          <div className="card-dark p-5 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[rgba(239,68,68,.1)] flex items-center justify-center text-[20px]">📄</div>
              <div>
                <p className="text-[14px] font-semibold text-t0">{profile.cvFileName ?? "cv.pdf"}</p>
                <p className="text-[12px] text-t2">CV hiện tại</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border border-border-dark text-[13px] text-t1 hover:bg-white/[.04] hover:text-t0 transition-colors">Xem CV</a>
              <button onClick={() => fileRef.current?.click()} className="btn-primary px-4 py-2 rounded-lg text-[13px]">Thay thế</button>
            </div>
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
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-[rgba(124,58,237,.08)]"
              : "border-border-dark hover:border-[rgba(124,58,237,.4)] hover:bg-[rgba(124,58,237,.03)]"
          }`}
        >
          <div className="text-5xl mb-4">📁</div>
          <p className="text-[15px] font-semibold text-t0 mb-2">Kéo thả hoặc nhấn để chọn CV</p>
          <p className="text-[13px] text-t2">PDF · Tối đa 5MB</p>
        </div>
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </ScrollReveal>

      {/* Progress */}
      {uploadMutation.isPending && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-t1">Đang upload...</span>
            <span className="text-primary font-semibold">{progress}%</span>
          </div>
          <div className="h-2 bg-bg-3 rounded-full overflow-hidden">
            <div className="h-full bg-brand-gradient rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {uploadMutation.isSuccess && (
        <p className="text-[13px] text-green-400">✓ Upload CV thành công!</p>
      )}

      {error && <p className="text-[13px] text-red-400">{error}</p>}
    </div>
  );
}
