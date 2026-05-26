import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  role: z.enum(["CANDIDATE", "EMPLOYER"]),
  fullName: z.string().min(2, "Tên ít nhất 2 ký tự").optional(),
  companyName: z.string().min(2, "Tên công ty ít nhất 2 ký tự").optional(),
  industry: z.string().optional(),
}).refine(
  (d) => d.role !== "CANDIDATE" || !!d.fullName,
  { message: "Họ tên là bắt buộc", path: ["fullName"] }
).refine(
  (d) => d.role !== "EMPLOYER" || !!d.companyName,
  { message: "Tên công ty là bắt buộc", path: ["companyName"] }
);

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP phải đúng 6 chữ số"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP phải đúng 6 chữ số"),
  newPassword: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});
