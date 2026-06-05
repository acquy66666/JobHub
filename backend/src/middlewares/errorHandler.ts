import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: err.issues[0]?.message ?? 'Dữ liệu không hợp lệ',
      errors: err.issues,
    });
    return;
  }

  if (err instanceof Error) {
    const e = err as Error & { status?: number; code?: string; requiredTier?: string };
    const status = e.status ?? 500;
    if (status >= 500) console.error(err.stack);
    res.status(status).json({
      message: err.message,
      ...(e.code && { code: e.code }),
      ...(e.requiredTier && { requiredTier: e.requiredTier }),
    });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
