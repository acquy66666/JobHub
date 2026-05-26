import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = verifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(email, otp);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { accessToken, refreshToken, user } = await authService.login(email, password);
      res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
      res.json({ accessToken, user });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken as string | undefined;
      if (!token) {
        res.status(401).json({ message: "Không có refresh token" });
        return;
      }
      const { accessToken, refreshToken } = await authService.refresh(token);
      res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
      res.json({ accessToken });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken as string | undefined;
      if (token) await authService.logout(token);
      res.clearCookie("refreshToken", { path: "/" });
      res.json({ message: "Đăng xuất thành công" });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(email);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(email, otp, newPassword);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const result = await authService.resendVerification(email);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
