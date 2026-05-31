import { Resend } from "resend";
import { env } from "../config/env";

function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not set — emails will be skipped");
    return null;
  }
  return new Resend(env.RESEND_API_KEY);
}

const FROM = "JobHub <onboarding@resend.dev>";

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const client = getClient();
  if (!client) {
    console.log(`[Email - DEV fallback] To: ${to} | Subject: ${subject}`);
    return;
  }
  const { error } = await client.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error(`[Email] Failed to send to ${to}:`, error);
    throw new Error(error.message);
  }
  console.log(`[Email] Sent "${subject}" → ${to}`);
}

export async function sendVerificationEmail(to: string, otp: string): Promise<void> {
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#7C3AED">Xác thực email JobHub</h2>
      <p>Mã OTP của bạn là:</p>
      <div style="font-size:36px;font-weight:900;letter-spacing:8px;color:#7C3AED;margin:16px 0">${otp}</div>
      <p style="color:#666">Mã có hiệu lực trong <strong>15 phút</strong>.</p>
    </div>`;
  await sendMail(to, "Xác thực email JobHub", html);
  if (env.NODE_ENV === "development") console.log(`[Email OTP] ${to} → ${otp}`);
}

export async function sendPasswordResetEmail(to: string, otp: string): Promise<void> {
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#7C3AED">Đặt lại mật khẩu JobHub</h2>
      <p>Mã OTP đặt lại mật khẩu của bạn:</p>
      <div style="font-size:36px;font-weight:900;letter-spacing:8px;color:#7C3AED;margin:16px 0">${otp}</div>
      <p style="color:#666">Mã có hiệu lực trong <strong>15 phút</strong>.</p>
    </div>`;
  await sendMail(to, "Đặt lại mật khẩu JobHub", html);
  if (env.NODE_ENV === "development") console.log(`[Password Reset OTP] ${to} → ${otp}`);
}

export async function sendApplicationEmail(to: string, jobTitle: string, candidateName: string): Promise<void> {
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#7C3AED">Đơn ứng tuyển mới — JobHub</h2>
      <p>Bạn có đơn ứng tuyển mới cho vị trí <strong>${jobTitle}</strong>.</p>
      <p>Ứng viên: <strong>${candidateName}</strong></p>
      <p style="color:#666">Đăng nhập vào JobHub để xem hồ sơ và phản hồi ứng viên.</p>
    </div>`;
  await sendMail(to, `Đơn ứng tuyển mới: ${jobTitle}`, html);
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xét duyệt",
  REVIEWING: "Đang xem xét",
  ACCEPTED: "Đã chấp nhận",
  REJECTED: "Bị từ chối",
};

export async function sendApplicationStatusEmail(to: string, jobTitle: string, status: string): Promise<void> {
  const label = STATUS_LABELS[status] ?? status;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#7C3AED">Cập nhật đơn ứng tuyển — JobHub</h2>
      <p>Đơn ứng tuyển của bạn cho vị trí <strong>${jobTitle}</strong> đã được cập nhật.</p>
      <p>Trạng thái mới: <strong style="color:#7C3AED">${label}</strong></p>
      <p style="color:#666">Đăng nhập vào JobHub để xem chi tiết.</p>
    </div>`;
  await sendMail(to, `Cập nhật đơn ứng tuyển: ${jobTitle}`, html);
}
