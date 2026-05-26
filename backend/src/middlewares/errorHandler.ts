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
    const status = (err as Error & { status?: number }).status ?? 500;
    const code = (err as Error & { code?: string }).code;
    if (status >= 500) console.error(err.stack);
    res.status(status).json({ message: err.message, ...(code && { code }) });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
