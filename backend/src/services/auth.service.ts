import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Role, Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email";

function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function otpExpiry(minutes = 15): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

const REFRESH_COOKIE = "refreshToken";

export const authService = {
  async register(data: {
    email: string;
    password: string;
    role: "CANDIDATE" | "EMPLOYER";
    fullName?: string;
    companyName?: string;
    industry?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw Object.assign(new Error("Email đã được sử dụng"), { status: 409 });

    const passwordHash = await bcrypt.hash(data.password, 12);
    const otp = generateOtp();

    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const u = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: data.role as Role,
          emailOtp: hashOtp(otp),
          emailOtpExpiry: otpExpiry(15),
        },
      });

      if (data.role === "CANDIDATE") {
        await tx.candidate.create({
          data: { userId: u.id, fullName: data.fullName! },
        });
      } else {
        await tx.employer.create({
          data: {
            userId: u.id,
            companyName: data.companyName!,
            industry: data.industry,
          },
        });
      }

      return u;
    });

    await sendVerificationEmail(user.email, otp);
    return { message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản." };
  },

  async verifyEmail(email: string, otp: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw Object.assign(new Error("Email không tồn tại"), { status: 404 });
    if (user.isVerified) throw Object.assign(new Error("Email đã được xác thực"), { status: 400 });
    if (!user.emailOtp || !user.emailOtpExpiry)
      throw Object.assign(new Error("Không có mã OTP"), { status: 400 });
    if (user.emailOtpExpiry < new Date())
      throw Object.assign(new Error("Mã OTP đã hết hạn"), { status: 400 });
    if (user.emailOtp !== hashOtp(otp))
      throw Object.assign(new Error("Mã OTP không đúng"), { status: 400 });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, emailOtp: null, emailOtpExpiry: null },
    });

    return { message: "Xác thực email thành công. Bạn có thể đăng nhập." };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        candidate: { select: { id: true, fullName: true, avatarUrl: true } },
        employer: { select: { id: true, companyName: true, logoUrl: true } },
      },
    });

    if (!user) throw Object.assign(new Error("Email hoặc mật khẩu không đúng"), { status: 401 });
    if (!user.isActive) throw Object.assign(new Error("Tài khoản đã bị khóa"), { status: 403 });
    if (!user.isVerified)
      throw Object.assign(
        new Error("Tài khoản chưa xác thực email"),
        { status: 403, code: "EMAIL_NOT_VERIFIED" }
      );

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw Object.assign(new Error("Email hoặc mật khẩu không đúng"), { status: 401 });

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken(user.id);
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const profile = user.role === "CANDIDATE" ? user.candidate : user.employer;

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile,
      },
    };
  },

  async refresh(rawRefreshToken: string) {
    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw Object.assign(new Error("Refresh token không hợp lệ"), { status: 401 });
    }

    const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    const stored = await prisma.refreshToken.findUnique({ where: { token: tokenHash } });

    if (!stored || stored.expiresAt < new Date())
      throw Object.assign(new Error("Refresh token hết hạn"), { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        candidate: { select: { id: true, fullName: true, avatarUrl: true } },
        employer: { select: { id: true, companyName: true, logoUrl: true } },
      },
    });
    if (!user || !user.isActive)
      throw Object.assign(new Error("Tài khoản không hợp lệ"), { status: 401 });

    // Rotation: delete old, create new
    const newRefreshToken = signRefreshToken(user.id);
    const newHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { token: tokenHash } }),
      prisma.refreshToken.create({
        data: {
          token: newHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const profile = user.role === "CANDIDATE" ? user.candidate : user.employer;
    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile,
      },
    };
  },

  async logout(rawRefreshToken: string) {
    const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    await prisma.refreshToken.deleteMany({ where: { token: tokenHash } });
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to avoid user enumeration
    if (!user || !user.isActive) return { message: "Nếu email tồn tại, bạn sẽ nhận được mã OTP." };

    const otp = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetOtp: hashOtp(otp), passwordResetExpiry: otpExpiry(15) },
    });

    await sendPasswordResetEmail(email, otp);
    return { message: "Nếu email tồn tại, bạn sẽ nhận được mã OTP." };
  },

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw Object.assign(new Error("Email không tồn tại"), { status: 404 });
    if (!user.passwordResetOtp || !user.passwordResetExpiry)
      throw Object.assign(new Error("Không có yêu cầu đặt lại mật khẩu"), { status: 400 });
    if (user.passwordResetExpiry < new Date())
      throw Object.assign(new Error("Mã OTP đã hết hạn"), { status: 400 });
    if (user.passwordResetOtp !== hashOtp(otp))
      throw Object.assign(new Error("Mã OTP không đúng"), { status: 400 });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, passwordResetOtp: null, passwordResetExpiry: null },
      }),
      prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
    ]);

    return { message: "Đặt lại mật khẩu thành công." };
  },

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isVerified) return { message: "Nếu email chưa xác thực, bạn sẽ nhận được mã mới." };

    const otp = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: { emailOtp: hashOtp(otp), emailOtpExpiry: otpExpiry(15) },
    });

    await sendVerificationEmail(email, otp);
    return { message: "Nếu email chưa xác thực, bạn sẽ nhận được mã mới." };
  },
};
