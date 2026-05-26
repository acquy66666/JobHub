"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import api from "@/lib/api";

interface Props {
  jobId: string;
  jobTitle: string;
  savedCvUrl?: string | null;
  savedCvFileName?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplyModal({ jobId, jobTitle, savedCvUrl, savedCvFileName, isOpen, onClose }: Props) {
  const [coverLetter, setCoverLetter] = useState("");
  const [useSavedCv, setUseSavedCv] = useState(!!savedCvUrl);
  const [newCvFile, setNewCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!useSavedCv && !newCvFile) {
      setError("Vui lòng chọn CV để ứng tuyển");
      return;
    }

    setLoading(true);
    try {
      let cvUrl = savedCvUrl;

      if (!useSavedCv && newCvFile) {
        const formData = new FormData();
        formData.append("cv", newCvFile);
        const res = await api.post("/candidate/cv", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        cvUrl = res.data.cvUrl;
      }

      await api.post("/candidate/applications", { jobId, cvUrl, coverLetter: coverLetter || undefined });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg bg-bg-2 border border-border-dark rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,.12)] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-bold text-t0 mb-2">Ứng tuyển thành công!</h3>
                <p className="text-[14px] text-t1 mb-6">Nhà tuyển dụng sẽ liên hệ với bạn sớm.</p>
                <button onClick={onClose} className="btn-primary px-6 py-2.5 rounded-xl text-[14px]">Đóng</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-bold text-t0">Ứng tuyển</h3>
                  <button type="button" onClick={onClose} className="text-t2 hover:text-t0 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-[14px] text-t1">Vị trí: <span className="text-t0 font-semibold">{jobTitle}</span></p>

                {/* CV selection */}
                <div className="space-y-3">
                  <label className="text-[12px] font-semibold text-t1 uppercase tracking-wide">CV của bạn</label>
                  {savedCvUrl && (
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-border-dark cursor-pointer hover:border-[rgba(124,58,237,.4)] transition-colors">
                      <input type="radio" checked={useSavedCv} onChange={() => setUseSavedCv(true)} className="accent-[#7C3AED]" />
                      <div>
                        <p className="text-[13px] font-medium text-t0">Dùng CV đã tải lên</p>
                        <p className="text-[12px] text-t2">{savedCvFileName ?? "cv.pdf"}</p>
                      </div>
                    </label>
                  )}
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-border-dark cursor-pointer hover:border-[rgba(124,58,237,.4)] transition-colors">
                    <input type="radio" checked={!useSavedCv} onChange={() => setUseSavedCv(false)} className="accent-[#7C3AED]" />
                    <span className="text-[13px] text-t0">Tải CV mới (PDF, max 5MB)</span>
                  </label>
                  {!useSavedCv && (
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setNewCvFile(e.target.files?.[0] ?? null)}
                      className="w-full text-[13px] text-t1 bg-bg-3 border border-border-dark rounded-xl px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[rgba(124,58,237,.15)] file:text-[#B09BF8] hover:file:bg-[rgba(124,58,237,.25)]"
                    />
                  )}
                </div>

                {/* Cover letter */}
                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-t1 uppercase tracking-wide">Thư giới thiệu (tùy chọn)</label>
                  <textarea
                    rows={4}
                    placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full bg-bg-3 border border-border-dark rounded-xl px-4 py-3 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] resize-none transition-all"
                  />
                </div>

                {error && <p className="text-[13px] text-red-400">{error}</p>}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-border-dark text-[14px] text-t1 hover:bg-white/[.04] hover:text-t0 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary py-2.5 rounded-xl text-[14px] font-semibold disabled:opacity-60"
                  >
                    {loading ? "Đang gửi..." : "Gửi đơn ứng tuyển"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
