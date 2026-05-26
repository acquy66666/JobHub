import { Response, NextFunction } from "express";
import { AuthRequest } from "./authGuard";

export function roleGuard(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Không có quyền truy cập" });
      return;
    }
    next();
  };
}
