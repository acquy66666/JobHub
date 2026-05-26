"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) { setError("Vui lòng nhập đủ 6 chữ số OTP"); return; }
    if (password.length < 6) { setError("Mật khẩu ít nhất 6 ký tự"); return; }
    if (password !== confirm) { setError("Mật khẩu không khớp"); return; }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, otp, newPassword: password });
      setSuccess(true);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Thất bại, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(124,58,237,.12) 0%,transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%,black 0%,transparent 100%)" }} />

      <ScrollReveal className="relative w-full max-w-[440px]">
        <div className="bg-bg-2 border border-border-dark rounded-[20px] p-8 md:p-10">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-[28px] mx-auto mb-5 bg-[rgba(34,197,94,.12)] border border-[rgba(34,197,94,.25)]">✓</div>
              <h3 className="text-[22px] font-bold mb-2">Đặt lại thành công!</h3>
              <p className="text-[14px] text-t1 mb-6">Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập với mật khẩu mới.</p>
              <button onClick={() => router.push("/login")}
                className="btn-primary w-full text-[15px] py-[14px] rounded-[12px]">
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-[14px] bg-[rgba(124,58,237,.12)] border border-[rgba(124,58,237,.2)] flex items-center justify-center text-[24px] mx-auto mb-6">
                🔑
              </div>
              <h2 className="text-[24px] font-extrabold tracking-[-0.025em] mb-2 text-center">Đặt lại mật khẩu</h2>
              <p className="text-[14px] text-t1 text-center mb-8">
                Nhập mã OTP từ email và mật khẩu mới của bạn.
              </p>

              {error && (
                <div className="mb-5 p-3 rounded-[10px] bg-[rgba(239,68,68,.08)] border border-[rgba(239,68,68,.2)] text-[13px] text-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-t1 mb-2">Mã OTP (6 chữ số)</label>
                  <input
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                    inputMode="numeric"
                    placeholder="000000"
                    className="w-full bg-bg-0 border border-border-dark rounded-[12px] px-4 py-[13px] text-[18px] font-bold text-t0 placeholder:text-t2 text-center tracking-[8px] outline-none transition-all focus:border-[rgba(124,58,237,.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)]"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-t1 mb-2">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      type={showPw ? "text" : "password"}
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full bg-bg-0 border border-border-dark rounded-[12px] px-4 py-[13px] pr-[46px] text-[14px] text-t0 placeholder:text-t2 outline-none transition-all focus:border-[rgba(124,58,237,.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)]"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-[14px] top-1/2 -translate-y-1/2 text-t2 hover:text-t1 transition-colors p-1">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-[13px] font-semibold text-t1 mb-2">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <input
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                      type={showConfirm ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full bg-bg-0 border border-border-dark rounded-[12px] px-4 py-[13px] pr-[46px] text-[14px] text-t0 placeholder:text-t2 outline-none transition-all focus:border-[rgba(124,58,237,.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)]"
                    />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-[14px] top-1/2 -translate-y-1/2 text-t2 hover:text-t1 transition-colors p-1">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full text-[15px] py-[14px] rounded-[12px] mb-5 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading ? <span className="w-[18px] h-[18px] border-2 border-white/35 border-t-white rounded-full animate-spin" /> : "Đặt lại mật khẩu"}
                </button>
              </form>

              <p className="text-center text-[13px] text-t2">
                <Link href="/forgot-password" className="text-[#B09BF8] hover:text-t0 transition-colors">← Gửi lại email</Link>
                {" · "}
                <Link href="/login" className="text-[#B09BF8] hover:text-t0 transition-colors">Đăng nhập</Link>
              </p>
            </>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
