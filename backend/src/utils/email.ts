import nodemailer from "nodemailer";
import { env } from "../config/env";

function createTransport() {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });
}

async function sendMail(to: string, subject: string, html: string) {
  const transport = createTransport();
  if (!transport) {
    console.log(`[Email - DEV fallback] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transport.sendMail({ from: `"JobHub" <${env.GMAIL_USER}>`, to, subject, html });
}

export async function sendVerificationEmail(to: string, otp: string) {
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

export async function sendPasswordResetEmail(to: string, otp: string) {
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

export async function sendApplicationEmail(to: string, jobTitle: string, candidateName: string) {
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
  PENDING: 'Chờ xét duyệt',
  REVIEWING: 'Đang xem xét',
  ACCEPTED: 'Đã chấp nhận',
  REJECTED: 'Bị từ chối',
};

export async function sendApplicationStatusEmail(to: string, jobTitle: string, status: string) {
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
