"use client";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, User, Building2 } from "lucide-react";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { GradientText } from "@/components/common/GradientText";
import api from "@/lib/api";

type Role = "CANDIDATE" | "EMPLOYER";
type Step = 1 | 2 | 3;

function PasswordStrength({ password }: { password: string }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length;
  const colors = ["bg-danger", "bg-warning", "bg-warning", "bg-success", "bg-success"];
  const labels = ["", "Yếu", "Trung bình", "Khá", "Mạnh"];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : "bg-border-dark"}`} />
        ))}
      </div>
      {password && <p className="text-[11px] text-t2 mt-1">{labels[score]}</p>}
    </div>
  );
}

const stepLabels = ["Loại tài khoản", "Thông tin cơ bản", "Hoàn thành"];

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role>("CANDIDATE");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "", companyName: "", industry: "", agree: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.fullName && role === "CANDIDATE") e.fullName = "Vui lòng nhập họ tên";
    if (!form.companyName && role === "EMPLOYER") e.companyName = "Vui lòng nhập tên công ty";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email không hợp lệ";
    if (form.password.length < 6) e.password = "Mật khẩu ít nhất 6 ký tự";
    if (form.password !== form.confirm) e.confirm = "Mật khẩu không khớp";
    if (!form.agree) e.agree = "Vui lòng đồng ý điều khoản";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (step === 1) { setStep(2); return; }
    if (step !== 2 || !validateStep2()) return;

    setLoading(true);
    setApiError("");
    try {
      await api.post("/auth/register", {
        email: form.email,
        password: form.password,
        role,
        fullName: role === "CANDIDATE" ? form.fullName : undefined,
        companyName: role === "EMPLOYER" ? form.companyName : undefined,
        industry: role === "EMPLOYER" ? form.industry : undefined,
      });
      setStep(3);
    } catch (err: unknown) {
      setApiError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Đăng ký thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-verification", { email: form.email });
    } catch { /* silent */ }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[2fr_3fr]">
      {/* Left panel */}
      <div className="hidden lg:flex relative bg-bg-1 flex-col justify-center px-12 py-16 overflow-hidden">
        <div className="absolute -top-[100px] -left-[100px] w-[500px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(124,58,237,.22) 0%,transparent 65%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 90% 90% at 30% 40%,black 0%,transparent 100%)" }} />
        <ScrollReveal className="relative z-10">
          <Link href="/" className="flex items-center gap-[10px] no-underline mb-12">
            <div className="w-11 h-11 bg-brand-gradient rounded-[12px] flex items-center justify-center font-black text-[20px] text-white shadow-[0_0_28px_rgba(124,58,237,.5)]">J</div>
            <span className="text-[24px] font-extrabold tracking-[-0.02em]">JobHub</span>
          </Link>
          <h2 className="text-[clamp(26px,3vw,38px)] font-black leading-[1.1] tracking-[-0.03em] mb-4">
            Bắt đầu<br /><GradientText>hành trình mới</GradientText>
          </h2>
          <p className="text-[14px] text-t1 leading-[1.7] mb-10">Tạo tài khoản miễn phí và khám phá hàng nghìn cơ hội việc làm phù hợp.</p>
          <div className="flex flex-col gap-3">
            {stepLabels.map((label, i) => {
              const s = (i + 1) as Step;
              const done = step > s;
              const active = step === s;
              return (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 transition-all ${done ? "bg-success text-white" : active ? "bg-brand-gradient text-white" : "bg-bg-3 text-t2"}`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span className={`text-[14px] ${active ? "text-t0 font-semibold" : done ? "text-success" : "text-t2"}`}>{label}</span>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center px-6 py-20 md:px-12">
        <ScrollReveal className="w-full max-w-[500px]">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? "bg-brand-gradient" : "bg-border-dark"}`} />
            ))}
          </div>

          {step === 3 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-[28px] mx-auto mb-5 bg-[rgba(34,197,94,.12)] border border-[rgba(34,197,94,.25)]">✉️</div>
              <h3 className="text-[22px] font-bold mb-2">Kiểm tra email của bạn</h3>
              <p className="text-[14px] text-t1 mb-1">Chúng tôi đã gửi mã OTP xác thực đến</p>
              <p className="text-[14px] font-semibold text-[#B09BF8] mb-6">{form.email}</p>
              <div className="bg-bg-2 border border-border-dark rounded-[12px] p-4 text-left mb-6">
                <p className="text-[13px] text-t1">💡 Không thấy email? Kiểm tra hộp thư spam hoặc{" "}
                  <button onClick={handleResend} className="text-[#B09BF8] hover:text-t0 transition-colors">gửi lại</button>
                </p>
              </div>
              <Link href={`/verify-email?email=${encodeURIComponent(form.email)}`}
                className="btn-primary inline-flex items-center text-[14px] px-6 py-3 rounded-[11px]">
                Nhập mã xác thực →
              </Link>
            </div>
          ) : step === 1 ? (
            <>
              <h2 className="text-[26px] font-extrabold tracking-[-0.025em] mb-2">Tạo tài khoản</h2>
              <p className="text-[14px] text-t1 mb-8">Bạn muốn tham gia JobHub với tư cách nào?</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {([["CANDIDATE", User, "Ứng viên", "Tìm việc, upload CV, theo dõi đơn"], ["EMPLOYER", Building2, "Nhà tuyển dụng", "Đăng tin, quản lý ứng viên"]] as const).map(([r, Icon, label, desc]) => (
                  <button key={r} onClick={() => setRole(r)}
                    className={`p-5 rounded-[14px] border text-left transition-all hover:-translate-y-0.5 ${role === r ? "border-primary bg-[rgba(124,58,237,.08)] shadow-[0_0_0_1px_rgba(124,58,237,.3)]" : "border-border-dark bg-bg-2 hover:border-[rgba(124,58,237,.3)]"}`}>
                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center mb-3 ${role === r ? "bg-[rgba(124,58,237,.2)]" : "bg-bg-3"}`}>
                      <Icon size={20} className={role === r ? "text-[#B09BF8]" : "text-t1"} />
                    </div>
                    <div className="text-[15px] font-bold mb-1">{label}</div>
                    <div className="text-[12px] text-t2 leading-[1.5]">{desc}</div>
                  </button>
                ))}
              </div>
              <button onClick={handleNext} className="btn-primary w-full text-[15px] py-[14px] rounded-[12px]">Tiếp tục →</button>
              <p className="text-center mt-6 text-[13px] text-t2">
                Đã có tài khoản? <Link href="/login" className="text-[#B09BF8] font-semibold hover:text-t0 transition-colors">Đăng nhập</Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-[26px] font-extrabold tracking-[-0.025em] mb-2">
                {role === "CANDIDATE" ? "Thông tin cá nhân" : "Thông tin công ty"}
              </h2>
              <p className="text-[14px] text-t1 mb-8">Điền thông tin để tạo tài khoản {role === "CANDIDATE" ? "ứng viên" : "nhà tuyển dụng"}.</p>

              {apiError && (
                <div className="mb-5 p-3 rounded-[10px] bg-[rgba(239,68,68,.08)] border border-[rgba(239,68,68,.2)] text-[13px] text-danger">
                  {apiError}
                </div>
              )}

              {role === "CANDIDATE" ? (
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-t1 mb-2">Họ và tên</label>
                  <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Nguyễn Văn A"
                    className={`w-full bg-bg-2 border rounded-[12px] px-4 py-[13px] text-[14px] text-t0 placeholder:text-t2 outline-none transition-all focus:border-[rgba(124,58,237,.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] ${errors.fullName ? "border-danger" : "border-border-dark"}`} />
                  {errors.fullName && <p className="text-[12px] text-danger mt-1">{errors.fullName}</p>}
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <label className="block text-[13px] font-semibold text-t1 mb-2">Tên công ty</label>
                    <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Công ty ABC"
                      className={`w-full bg-bg-2 border rounded-[12px] px-4 py-[13px] text-[14px] text-t0 placeholder:text-t2 outline-none transition-all focus:border-[rgba(124,58,237,.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] ${errors.companyName ? "border-danger" : "border-border-dark"}`} />
                    {errors.companyName && <p className="text-[12px] text-danger mt-1">{errors.companyName}</p>}
                  </div>
                  <div className="mb-5">
                    <label className="block text-[13px] font-semibold text-t1 mb-2">Ngành nghề</label>
                    <select value={form.industry} onChange={(e) => set("industry", e.target.value)}
                      className="w-full bg-bg-2 border border-border-dark rounded-[12px] px-4 py-[13px] text-[14px] text-t0 outline-none transition-all focus:border-[rgba(124,58,237,.55)]">
                      <option value="">Chọn ngành nghề</option>
                      {["Công nghệ thông tin", "Tài chính / Ngân hàng", "Thương mại điện tử", "Y tế / Sức khỏe", "Giáo dục", "Khác"].map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-t1 mb-2">Email</label>
                <input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" placeholder="you@example.com"
                  className={`w-full bg-bg-2 border rounded-[12px] px-4 py-[13px] text-[14px] text-t0 placeholder:text-t2 outline-none transition-all focus:border-[rgba(124,58,237,.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] ${errors.email ? "border-danger" : "border-border-dark"}`} />
                {errors.email && <p className="text-[12px] text-danger mt-1">{errors.email}</p>}
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-t1 mb-2">Mật khẩu</label>
                <div className="relative">
                  <input value={form.password} onChange={(e) => set("password", e.target.value)} type={showPw ? "text" : "password"} placeholder="Ít nhất 6 ký tự"
                    className={`w-full bg-bg-2 border rounded-[12px] px-4 py-[13px] pr-[46px] text-[14px] text-t0 placeholder:text-t2 outline-none transition-all focus:border-[rgba(124,58,237,.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] ${errors.password ? "border-danger" : "border-border-dark"}`} />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-[14px] top-1/2 -translate-y-1/2 text-t2 hover:text-t1 transition-colors p-1">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && <PasswordStrength password={form.password} />}
                {errors.password && <p className="text-[12px] text-danger mt-1">{errors.password}</p>}
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-t1 mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input value={form.confirm} onChange={(e) => set("confirm", e.target.value)} type={showConfirm ? "text" : "password"} placeholder="Nhập lại mật khẩu"
                    className={`w-full bg-bg-2 border rounded-[12px] px-4 py-[13px] pr-[46px] text-[14px] text-t0 placeholder:text-t2 outline-none transition-all focus:border-[rgba(124,58,237,.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] ${errors.confirm ? "border-danger" : "border-border-dark"}`} />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-[14px] top-1/2 -translate-y-1/2 text-t2 hover:text-t1 transition-colors p-1">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirm && <p className="text-[12px] text-danger mt-1">{errors.confirm}</p>}
              </div>

              <label className="flex items-start gap-[9px] cursor-pointer mb-6">
                <input type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} className="w-4 h-4 mt-0.5 accent-primary cursor-pointer" />
                <span className="text-[13px] text-t1">Tôi đồng ý với <Link href="#" className="text-[#B09BF8]">Điều khoản sử dụng</Link> và <Link href="#" className="text-[#B09BF8]">Chính sách bảo mật</Link></span>
              </label>
              {errors.agree && <p className="text-[12px] text-danger -mt-4 mb-4">{errors.agree}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-5 py-[14px] rounded-[12px] border border-border-dark text-t1 text-[14px] font-semibold hover:border-white/[.14] hover:text-t0 transition-all">
                  ← Quay lại
                </button>
                <button onClick={handleNext} disabled={loading}
                  className="btn-primary flex-1 text-[15px] py-[14px] rounded-[12px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading ? <span className="w-[18px] h-[18px] border-2 border-white/35 border-t-white rounded-full animate-spin" /> : "Tạo tài khoản"}
                </button>
              </div>
            </>
          )}
        </ScrollReveal>
      </div>
    </div>
  );
}
