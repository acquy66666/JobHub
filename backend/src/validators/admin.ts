import { z } from 'zod';

export const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['CANDIDATE', 'EMPLOYER', 'ADMIN']).optional(),
  employerVerified: z.boolean().optional(),
}).refine(d => d.isActive !== undefined || d.role !== undefined || d.employerVerified !== undefined, {
  message: 'Cần ít nhất một trường để cập nhật',
});

export const updateJobStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'REJECTED']),
});

export const adminJobsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  status: z.string().optional(),
});

export const adminUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  role: z.enum(['CANDIDATE', 'EMPLOYER', 'ADMIN']).optional(),
  keyword: z.string().optional(),
});

export const adminReportsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(15),
  status: z.enum(['PENDING', 'REVIEWED', 'DISMISSED']).optional(),
});

export const updateReportSchema = z.object({
  status: z.enum(['REVIEWED', 'DISMISSED']),
  adminNote: z.string().max(500).optional(),
});

export const createReportSchema = z.object({
  targetType: z.enum(['JOB']),
  targetId: z.string().min(1),
  reason: z.enum(['SPAM', 'MISLEADING', 'INAPPROPRIATE', 'FRAUD', 'OTHER']),
  description: z.string().max(500).optional(),
});
