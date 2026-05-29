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
