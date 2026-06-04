import https from "https";
import { env } from "../config/env";

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) {
    console.warn("[Email] BREVO credentials not set — emails will be skipped");
    console.log(`[Email - DEV fallback] To: ${to} | Subject: ${subject}`);
    return;
  }

  const body = JSON.stringify({
    sender: { name: "JobHub", email: env.BREVO_SENDER_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": env.BREVO_API_KEY,
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          console.log(`[Email] Brevo response ${res.statusCode}: ${data}`);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Brevo API ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error("Email timeout")));
    req.write(body);
    req.end();
  });
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

const STATUS_CONFIG: Record<string, { label: string; color: string; emoji: string; message: string }> = {
  REVIEWING: {
    label: "Đang xem xét",
    color: "#3B82F6",
    emoji: "🔍",
    message: "Hồ sơ của bạn đang được nhà tuyển dụng xem xét. Chúng tôi sẽ phản hồi sớm nhất có thể.",
  },
  ACCEPTED: {
    label: "Đã chấp nhận",
    color: "#22C55E",
    emoji: "🎉",
    message: "Chúc mừng! Hồ sơ của bạn đã được chấp nhận. Nhà tuyển dụng sẽ liên hệ để trao đổi các bước tiếp theo.",
  },
  REJECTED: {
    label: "Không phù hợp",
    color: "#EF4444",
    emoji: "📋",
    message: "Cảm ơn bạn đã ứng tuyển. Rất tiếc hồ sơ chưa phù hợp với vị trí này lần này. Chúc bạn may mắn ở các cơ hội khác.",
  },
  PENDING: {
    label: "Chờ xét duyệt",
    color: "#F59E0B",
    emoji: "⏳",
    message: "Đơn ứng tuyển của bạn đã được ghi nhận và đang chờ xét duyệt.",
  },
};

export async function sendInterviewInviteEmail(
  to: string,
  candidateName: string,
  companyName: string,
  jobTitle: string,
  scheduledAt: Date,
  location?: string,
  meetingLink?: string,
): Promise<void> {
  const dateStr = scheduledAt.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = scheduledAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const locationHtml = location
    ? `<div style="margin-top:12px;padding:12px 16px;background:#1A1A28;border-radius:10px">
         <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9494B0;text-transform:uppercase;letter-spacing:.06em">Địa điểm</p>
         <p style="margin:0;font-size:14px;color:#F5F5FF">${location}</p>
       </div>`
    : '';
  const meetingHtml = meetingLink
    ? `<div style="margin-top:12px;padding:12px 16px;background:#1A1A28;border-radius:10px">
         <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9494B0;text-transform:uppercase;letter-spacing:.06em">Link phỏng vấn</p>
         <a href="${meetingLink}" style="font-size:14px;color:#7C3AED">${meetingLink}</a>
       </div>`
    : '';
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0E0E18;color:#F5F5FF;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#7C3AED,#3B82F6);padding:28px 32px">
        <h1 style="margin:0;font-size:20px;font-weight:800;color:#fff">JobHub</h1>
        <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,.7)">Thư mời phỏng vấn</p>
      </div>
      <div style="padding:28px 32px">
        <div style="font-size:32px;margin-bottom:12px">📅</div>
        <h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#7C3AED">Bạn có lịch phỏng vấn mới!</h2>
        <p style="margin:0 0 4px;font-size:14px;color:#9494B0">Xin chào <strong style="color:#F5F5FF">${candidateName}</strong>,</p>
        <p style="margin:0 0 20px;font-size:14px;color:#9494B0;line-height:1.6">
          <strong style="color:#F5F5FF">${companyName}</strong> mời bạn tham gia phỏng vấn cho vị trí
          <strong style="color:#F5F5FF">${jobTitle}</strong>.
        </p>
        <div style="padding:16px;background:#13131E;border-radius:12px;border:1px solid #252538">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9494B0;text-transform:uppercase;letter-spacing:.06em">Thời gian</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#F5F5FF">${dateStr} — ${timeStr}</p>
        </div>
        ${locationHtml}
        ${meetingHtml}
        <p style="margin:20px 0 0;font-size:13px;color:#9494B0">Vui lòng xác nhận hoặc từ chối lịch phỏng vấn trong ứng dụng JobHub.</p>
      </div>
      <div style="padding:20px 32px;border-top:1px solid #252538;text-align:center">
        <a href="${env.CLIENT_URL}/candidate/applications"
           style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#3B82F6);color:#fff;text-decoration:none;padding:10px 24px;border-radius:10px;font-size:13px;font-weight:600">
          Xem lịch phỏng vấn
        </a>
      </div>
    </div>`;
  await sendMail(to, `📅 Thư mời phỏng vấn: ${jobTitle} — ${companyName}`, html);
}

export async function sendApplicationStatusEmail(to: string, jobTitle: string, status: string, note?: string): Promise<void> {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#7C3AED", emoji: "ℹ️", message: "Trạng thái đơn ứng tuyển của bạn đã được cập nhật." };
  const noteHtml = note
    ? `<div style="margin-top:16px;padding:14px 16px;background:#1A1A28;border-radius:12px;border-left:3px solid ${cfg.color}">
         <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#9494B0;text-transform:uppercase;letter-spacing:.06em">Ghi chú từ nhà tuyển dụng</p>
         <p style="margin:0;font-size:14px;color:#F5F5FF">${note}</p>
       </div>`
    : "";
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0E0E18;color:#F5F5FF;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#7C3AED,#3B82F6);padding:28px 32px">
        <h1 style="margin:0;font-size:20px;font-weight:800;color:#fff">JobHub</h1>
        <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,.7)">Cập nhật đơn ứng tuyển</p>
      </div>
      <div style="padding:28px 32px">
        <div style="font-size:32px;margin-bottom:12px">${cfg.emoji}</div>
        <h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:${cfg.color}">${cfg.label}</h2>
        <p style="margin:0 0 16px;font-size:14px;color:#9494B0">
          Vị trí: <strong style="color:#F5F5FF">${jobTitle}</strong>
        </p>
        <p style="margin:0;font-size:14px;color:#9494B0;line-height:1.6">${cfg.message}</p>
        ${noteHtml}
      </div>
      <div style="padding:20px 32px;border-top:1px solid #252538;text-align:center">
        <a href="${env.CLIENT_URL}/candidate/applications"
           style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#3B82F6);color:#fff;text-decoration:none;padding:10px 24px;border-radius:10px;font-size:13px;font-weight:600">
          Xem chi tiết đơn ứng tuyển
        </a>
      </div>
    </div>`;
  await sendMail(to, `${cfg.emoji} ${cfg.label}: ${jobTitle}`, html);
}
