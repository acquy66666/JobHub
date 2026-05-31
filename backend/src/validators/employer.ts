import { z } from 'zod';

const urlOrEmpty = z.string().url('URL không hợp lệ').optional().or(z.literal(''));

export const updateProfileSchema = z.object({
  companyName: z.string().min(2, 'Tên công ty ít nhất 2 ký tự').optional(),
  description: z.string().optional(),
  website: urlOrEmpty,
  industry: z.string().optional(),
  companySize: z.string().optional(),
  location: z.string().optional(),
});

export const createJobSchema = z.object({
  title: z.string().min(3, 'Tiêu đề ít nhất 3 ký tự'),
  description: z.string().min(20, 'Mô tả ít nhất 20 ký tự'),
  requirements: z.string().min(10, 'Yêu cầu ít nhất 10 ký tự'),
  benefits: z.string().optional(),
  location: z.string().min(2, 'Địa điểm ít nhất 2 ký tự'),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']),
  workMode: z.enum(['ON_SITE', 'REMOTE', 'HYBRID']),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  salaryCurrency: z.string().optional().default('VND'),
  experience: z.string().optional(),
  industry: z.string().min(2, 'Ngành nghề ít nhất 2 ký tự'),
  expiresAt: z.string().datetime('Ngày hết hạn không hợp lệ'),
});

export const updateJobSchema = createJobSchema.partial();

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED']),
  note: z.string().optional(),
});

export const updateApplicationTagSchema = z.object({
  tag: z.enum(['SHORTLISTED', 'ON_HOLD', 'POTENTIAL']).nullable(),
});
