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
  tier: z.enum(['BASIC', 'PREMIUM', 'VIP']).optional().default('BASIC'),
  skillSlugs: z.array(z.string()).max(20, 'Tối đa 20 kỹ năng').optional(),
  experienceTier: z.enum(['NO_EXP', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD']).optional().default('NO_EXP'),
  experienceYearsMin: z.coerce.number().int().min(0).max(50).optional().nullable(),
  experienceYearsMax: z.coerce.number().int().min(0).max(50).optional().nullable(),
}).refine(
  (d) => d.experienceYearsMin == null || d.experienceYearsMax == null || d.experienceYearsMax >= d.experienceYearsMin,
  { message: 'experienceYearsMax phải >= experienceYearsMin', path: ['experienceYearsMax'] },
);

export const updateJobSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(20).optional(),
  requirements: z.string().min(10).optional(),
  benefits: z.string().optional(),
  location: z.string().min(2).optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']).optional(),
  workMode: z.enum(['ON_SITE', 'REMOTE', 'HYBRID']).optional(),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  salaryCurrency: z.string().optional(),
  experience: z.string().optional(),
  industry: z.string().min(2).optional(),
  expiresAt: z.string().datetime().optional(),
  tier: z.enum(['BASIC', 'PREMIUM', 'VIP']).optional(),
  skillSlugs: z.array(z.string()).max(20).optional(),
  experienceTier: z.enum(['NO_EXP', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD']).optional(),
  experienceYearsMin: z.coerce.number().int().min(0).max(50).optional().nullable(),
  experienceYearsMax: z.coerce.number().int().min(0).max(50).optional().nullable(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED']),
  note: z.string().optional(),
});

export const updateApplicationTagSchema = z.object({
  tag: z.enum(['SHORTLISTED', 'ON_HOLD', 'POTENTIAL']).nullable(),
});
