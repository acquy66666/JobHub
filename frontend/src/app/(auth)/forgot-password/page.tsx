"use client";
import Link from "next/link";
import { useState } from "react";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setSent(true); // Always show sent for security (prevent user enumeration)
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
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-[28px] mx-auto mb-5 bg-[rgba(34,197,94,.12)] border border-[rgba(34,197,94,.25)]">✉️</div>
              <h3 className="text-[22px] font-bold mb-2">Email đã được gửi!</h3>
              <p className="text-[14px] text-t1 mb-1">Nếu email tồn tại, chúng tôi đã gửi mã OTP đến</p>
              <p className="text-[14px] font-semibold text-[#B09BF8] mb-6">{email}</p>
              <div className="bg-bg-1 border border-border-dark rounded-[12px] p-4 text-left mb-6">
                <p className="text-[13px] text-t1 leading-[1.65]">
                  💡 Mã OTP có hiệu lực trong <strong className="text-t0">15 phút</strong>. Không thấy email? Kiểm tra hộp thư spam.
                </p>
              </div>
              <Link href={`/reset-password?email=${encodeURIComponent(email)}`}
                className="btn-primary inline-flex items-center text-[14px] px-6 py-3 rounded-[11px] mb-4">
                Nhập mã OTP →
              </Link>
              <br />
              <button onClick={() => { setSent(false); setEmail(""); }}
                className="text-[13px] text-[#B09BF8] hover:text-t0 transition-colors">
                Gửi lại email →
              </button>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-[14px] bg-[rgba(124,58,237,.12)] border border-[rgba(124,58,237,.2)] flex items-center justify-center text-[24px] mx-auto mb-6">
                🔐
              </div>
              <h2 className="text-[24px] font-extrabold tracking-[-0.025em] mb-2 text-center">Quên mật khẩu?</h2>
              <p className="text-[14px] text-t1 text-center mb-8 leading-[1.65]">
                Nhập email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
              </p>

              <div className="flex flex-col gap-2 mb-8 p-4 bg-bg-1 rounded-[12px] border border-border-dark">
                {["Nhập email tài khoản của bạn", "Kiểm tra hộp thư và nhập mã OTP", "Đặt mật khẩu mới"].map((s, i) => (
                  <div key={s} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[rgba(124,58,237,.15)] text-[#B09BF8] text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                    <span className="text-[13px] text-t1">{s}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-t1 mb-2 tracking-[.01em]">Email</label>
                  <input
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    type="email"
                    placeholder="you@example.com"
                    className={`w-full bg-bg-0 border rounded-[12px] px-4 py-[13px] text-[14px] text-t0 placeholder:text-t2 outline-none transition-all focus:border-[rgba(124,58,237,.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] ${error ? "border-danger" : "border-border-dark"}`}
                  />
                  {error && <p className="text-[12px] text-danger mt-[6px]">{error}</p>}
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full text-[15px] py-[14px] rounded-[12px] mb-5 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading ? <span className="w-[18px] h-[18px] border-2 border-white/35 border-t-white rounded-full animate-spin" /> : "Gửi mã OTP"}
                </button>
              </form>

              <p className="text-center text-[13px] text-t2">
                Nhớ ra mật khẩu rồi?{" "}
                <Link href="/login" className="text-[#B09BF8] font-semibold hover:text-t0 transition-colors">Đăng nhập</Link>
              </p>
            </>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
