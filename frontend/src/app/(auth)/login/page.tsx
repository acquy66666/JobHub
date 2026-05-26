"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { GradientText } from "@/components/common/GradientText";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  remember: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

const bullets = [
  { icon: "🎯", title: "10,000+ việc làm", desc: "Được cập nhật mỗi ngày từ top công ty" },
  { icon: "🏢", title: "850+ công ty uy tín", desc: "Từ startup đến tập đoàn đa quốc gia" },
  { icon: "✨", title: "Hoàn toàn miễn phí", desc: "Không mất phí, không giới hạn ứng tuyển" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setApiError("");
    try {
      const res = await api.post<{ accessToken: string; user: Parameters<typeof setAuth>[1] }>(
        "/auth/login",
        { email: data.email, password: data.password }
      );
      setAuth(res.data.accessToken, res.data.user);
      const next = searchParams.get("next");
      if (next) { router.push(next); return; }
      const role = res.data.user.role;
      router.push(role === "ADMIN" ? "/admin" : role === "EMPLOYER" ? "/employer" : "/candidate");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string; code?: string } } })
        ?.response?.data;
      if (msg?.code === "EMAIL_NOT_VERIFIED") {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
      setApiError(msg?.message ?? "Đăng nhập thất bại");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex relative bg-bg-1 flex-col justify-center px-14 py-16 overflow-hidden">
        <div className="absolute -top-[100px] -left-[100px] w-[500px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(124,58,237,.22) 0%,transparent 65%)" }} />
        <div className="absolute -bottom-[80px] -right-[80px] w-[380px] h-[380px] pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(59,130,246,.15) 0%,transparent 68%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 90% 90% at 30% 40%,black 0%,transparent 100%)" }} />
        <ScrollReveal className="relative z-10">
          <Link href="/" className="flex items-center gap-[10px] no-underline mb-12">
            <div className="w-11 h-11 bg-brand-gradient rounded-[12px] flex items-center justify-center font-black text-[20px] text-white shadow-[0_0_28px_rgba(124,58,237,.5)]">J</div>
            <span className="text-[24px] font-extrabold tracking-[-0.02em]">JobHub</span>
          </Link>
          <h2 className="text-[clamp(28px,3.5vw,42px)] font-black leading-[1.1] tracking-[-0.03em] mb-[14px]">
            Cầu nối<br /><GradientText>tài năng & cơ hội</GradientText>
          </h2>
          <p className="text-[15px] text-t1 leading-[1.7] mb-11 max-w-[360px]">
            Hàng nghìn cơ hội nghề nghiệp đang chờ bạn. Đăng nhập để tiếp tục hành trình sự nghiệp.
          </p>
          <div className="flex flex-col gap-4">
            {bullets.map((b) => (
              <div key={b.title} className="flex items-start gap-[14px]">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[16px] shrink-0 bg-[rgba(124,58,237,.12)] border border-[rgba(124,58,237,.2)]">{b.icon}</div>
                <div>
                  <strong className="text-[14px] font-semibold text-t0 block mb-[2px]">{b.title}</strong>
                  <span className="text-[13px] text-t2">{b.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-8 mt-11 pt-9 border-t border-border-dark">
            {[["50K+", "Ứng viên"], ["95%", "Hài lòng"], ["30 giây", "Để ứng tuyển"]].map(([v, l]) => (
              <div key={l}>
                <strong className="text-[20px] font-extrabold text-t0 tracking-[-0.02em] block">{v}</strong>
                <span className="text-[12px] text-t2">{l}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center px-6 py-20 md:px-10">
        <ScrollReveal className="w-full max-w-[440px]">
          <h2 className="text-[28px] font-extrabold tracking-[-0.025em] mb-2">Chào mừng trở lại</h2>
          <p className="text-[14px] text-t1 mb-8">Đăng nhập để tiếp tục tìm kiếm cơ hội của bạn.</p>

          {apiError && (
            <div className="mb-5 p-3 rounded-[10px] bg-[rgba(239,68,68,.08)] border border-[rgba(239,68,68,.2)] text-[13px] text-danger">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-t1 mb-2 tracking-[.01em]">Email</label>
              <input {...register("email")} type="email" placeholder="you@example.com"
                className={`w-full bg-bg-2 border rounded-[12px] px-4 py-[13px] text-[14px] text-t0 placeholder:text-t2 outline-none transition-all focus:border-[rgba(124,58,237,.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] ${errors.email ? "border-danger shadow-[0_0_0_3px_rgba(239,68,68,.1)]" : "border-border-dark"}`}
              />
              {errors.email && <p className="text-[12px] text-danger mt-[6px]">{errors.email.message}</p>}
            </div>

            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-t1 mb-2 tracking-[.01em]">Mật khẩu</label>
              <div className="relative">
                <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••"
                  className={`w-full bg-bg-2 border rounded-[12px] px-4 py-[13px] pr-[46px] text-[14px] text-t0 placeholder:text-t2 outline-none transition-all focus:border-[rgba(124,58,237,.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] ${errors.password ? "border-danger shadow-[0_0_0_3px_rgba(239,68,68,.1)]" : "border-border-dark"}`}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-[14px] top-1/2 -translate-y-1/2 text-t2 hover:text-t1 transition-colors p-1">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-[12px] text-danger mt-[6px]">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-[9px] cursor-pointer">
                <input {...register("remember")} type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" />
                <span className="text-[13px] text-t1">Ghi nhớ đăng nhập</span>
              </label>
              <Link href="/forgot-password" className="text-[13px] text-[#B09BF8] font-medium hover:text-t0 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="btn-primary w-full text-[15px] py-[14px] rounded-[12px] mb-5 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting ? <span className="w-[18px] h-[18px] border-2 border-white/35 border-t-white rounded-full animate-spin" /> : "Đăng nhập"}
            </button>

            <div className="flex items-center gap-3 my-6 text-t2 text-[13px]">
              <div className="flex-1 h-px bg-border-dark" />hoặc<div className="flex-1 h-px bg-border-dark" />
            </div>

            <button type="button"
              className="w-full bg-bg-2 border border-border-dark text-t1 rounded-[12px] py-[13px] text-[14px] font-medium flex items-center justify-center gap-[10px] hover:border-white/[.14] hover:text-t0 hover:bg-bg-3 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Tiếp tục với Google
            </button>
          </form>

          <p className="text-center mt-7 text-[13px] text-t2">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-[#B09BF8] font-semibold hover:text-t0 transition-colors">Đăng ký miễn phí</Link>
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
