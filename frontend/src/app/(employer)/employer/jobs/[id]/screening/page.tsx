"use client";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/store/toastStore";

interface ScreeningQuestion {
  id: string;
  question: string;
  type: "TEXT" | "YES_NO";
  isRequired: boolean;
  order: number;
}

export default function ScreeningQuestionsPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const toast = useToast();

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"TEXT" | "YES_NO">("TEXT");
  const [isRequired, setIsRequired] = useState(true);

  const { data: questions = [], isLoading } = useQuery<ScreeningQuestion[]>({
    queryKey: queryKeys.screeningQuestions(jobId),
    queryFn: () => api.get(`/employer/jobs/${jobId}/screening-questions`).then((r) => r.data),
    enabled: !!jobId,
  });

  const { data: jobData } = useQuery({
    queryKey: ["employer-job-title", jobId],
    queryFn: () => api.get(`/employer/jobs/${jobId}`).then((r) => r.data),
    enabled: !!jobId,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      api.post(`/employer/jobs/${jobId}/screening-questions`, {
        question: questionText.trim(),
        type: questionType,
        isRequired,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.screeningQuestions(jobId) });
      setQuestionText("");
      setQuestionType("TEXT");
      setIsRequired(true);
      toast.success("Đã thêm câu hỏi");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Thêm câu hỏi thất bại");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (questionId: string) =>
      api.delete(`/employer/jobs/${jobId}/screening-questions/${questionId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.screeningQuestions(jobId) });
      toast.info("Đã xóa câu hỏi");
    },
    onError: () => toast.error("Xóa câu hỏi thất bại"),
  });

  const atMax = questions.length >= 5;

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <ScrollReveal direction="up" className="mb-6">
        <Link href="/employer/jobs" className="text-[13px] text-t2 hover:text-t0 transition-colors">
          ← Quản lý tin
        </Link>
        <h1 className="text-[22px] font-extrabold text-t0 mt-2">Câu hỏi sàng lọc</h1>
        {jobData?.title && (
          <p className="text-[14px] text-t1 mt-1">Tin tuyển dụng: <span className="text-t0 font-semibold">{jobData.title}</span></p>
        )}
        <p className="text-[13px] text-t2 mt-1">Ứng viên sẽ thấy và phải trả lời các câu hỏi này khi nộp đơn. Tối đa 5 câu hỏi.</p>
      </ScrollReveal>

      {/* Add form */}
      <ScrollReveal direction="up" delay={0.05} className="card-dark p-5 rounded-2xl mb-6">
        <h2 className="text-[15px] font-bold text-t0 mb-4">Thêm câu hỏi mới</h2>
        <div className="space-y-3">
          <textarea
            rows={2}
            placeholder="Nội dung câu hỏi..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full bg-bg-3 border border-border-dark rounded-xl px-4 py-3 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] resize-none transition-all"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-[12px] text-t2 font-medium">Loại:</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as "TEXT" | "YES_NO")}
                className="bg-bg-3 border border-border-dark rounded-lg px-3 py-1.5 text-[12px] text-t0 focus:outline-none focus:border-[rgba(124,58,237,.5)] transition-all"
              >
                <option value="TEXT">Văn bản tự do</option>
                <option value="YES_NO">Có / Không</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="accent-[#7C3AED] w-4 h-4"
              />
              <span className="text-[12px] text-t1">Bắt buộc trả lời</span>
            </label>
            <button
              type="button"
              disabled={!questionText.trim() || atMax || addMutation.isPending}
              onClick={() => addMutation.mutate()}
              className="ml-auto btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {addMutation.isPending ? "Đang thêm..." : "+ Thêm câu hỏi"}
            </button>
          </div>
          {atMax && (
            <p className="text-[12px] text-yellow-400">Đã đạt tối đa 5 câu hỏi. Xóa bớt để thêm câu mới.</p>
          )}
        </div>
      </ScrollReveal>

      {/* Question list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 bg-bg-2 rounded-2xl animate-pulse" />
          ))
        ) : questions.length === 0 ? (
          <ScrollReveal direction="up" delay={0.1}>
            <div className="card-dark p-10 rounded-2xl text-center">
              <div className="text-4xl mb-3">❓</div>
              <p className="text-[14px] text-t1">Chưa có câu hỏi nào. Thêm câu hỏi đầu tiên ở trên.</p>
            </div>
          </ScrollReveal>
        ) : (
          questions.map((q, i) => (
            <ScrollReveal key={q.id} direction="up" delay={i * 0.04}>
              <div className="card-dark p-4 rounded-2xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[rgba(124,58,237,.15)] border border-[rgba(124,58,237,.25)] flex items-center justify-center text-[11px] font-bold text-[#B09BF8] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-t0 font-medium leading-relaxed">{q.question}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                      q.type === "YES_NO"
                        ? "bg-[rgba(59,130,246,.1)] text-[#60A5FA] border-[rgba(59,130,246,.2)]"
                        : "bg-[rgba(124,58,237,.1)] text-[#B09BF8] border-[rgba(124,58,237,.2)]"
                    }`}>
                      {q.type === "YES_NO" ? "Có/Không" : "Văn bản"}
                    </span>
                    {q.isRequired && (
                      <span className="text-[11px] text-red-400 font-medium">* Bắt buộc</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(q.id)}
                  disabled={deleteMutation.isPending}
                  className="shrink-0 p-1.5 rounded-lg text-t2 hover:text-red-400 hover:bg-[rgba(239,68,68,.08)] transition-colors disabled:opacity-40"
                  title="Xóa câu hỏi"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </ScrollReveal>
          ))
        )}
      </div>
    </div>
  );
}
