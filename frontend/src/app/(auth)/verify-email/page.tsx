"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, Suspense } from "react";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp];
    next[i] = v.slice(-1);
    setOtp(next);
    setError("");
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      refs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Vui lòng nhập đủ 6 chữ số"); return; }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/verify-email", { email, otp: code });
      router.push("/login?verified=1");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Xác thực thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-verification", { email });
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch { /* silent */ }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(124,58,237,.12) 0%,transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%,black 0%,transparent 100%)" }} />

      <ScrollReveal className="relative w-full max-w-[440px]">
        <div className="bg-bg-2 border border-border-dark rounded-[20px] p-8 md:p-10">
          <div className="w-14 h-14 rounded-[14px] bg-[rgba(124,58,237,.12)] border border-[rgba(124,58,237,.2)] flex items-center justify-center text-[24px] mx-auto mb-6">
            📧
          </div>
          <h2 className="text-[24px] font-extrabold tracking-[-0.025em] mb-2 text-center">Xác thực email</h2>
          <p className="text-[14px] text-t1 text-center mb-2 leading-[1.65]">
            Nhập mã OTP 6 chữ số đã gửi đến
          </p>
          <p className="text-[14px] font-semibold text-[#B09BF8] text-center mb-8 truncate">{email || "email của bạn"}</p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { refs.current[i] = el; }}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  maxLength={1}
                  inputMode="numeric"
                  className={`w-11 h-14 text-center text-[22px] font-bold bg-bg-0 border rounded-[12px] text-t0 outline-none transition-all focus:border-[rgba(124,58,237,.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] ${error ? "border-danger" : d ? "border-[rgba(124,58,237,.4)]" : "border-border-dark"}`}
                />
              ))}
            </div>

            {error && <p className="text-[12px] text-danger text-center mb-4">{error}</p>}

            <button type="submit" disabled={loading}
              className="btn-primary w-full text-[15px] py-[14px] rounded-[12px] mb-5 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <span className="w-[18px] h-[18px] border-2 border-white/35 border-t-white rounded-full animate-spin" /> : "Xác thực →"}
            </button>
          </form>

          <div className="text-center">
            {resent ? (
              <p className="text-[13px] text-success">✓ Đã gửi lại mã OTP</p>
            ) : (
              <p className="text-[13px] text-t2">
                Không nhận được mã?{" "}
                <button onClick={handleResend} className="text-[#B09BF8] font-semibold hover:text-t0 transition-colors">Gửi lại</button>
              </p>
            )}
            <Link href="/login" className="block mt-3 text-[13px] text-t2 hover:text-t1 transition-colors">← Quay lại đăng nhập</Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
