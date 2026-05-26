import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Tên ít nhất 2 ký tự').optional(),
  phone: z.string().optional(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export const addExperienceSchema = z.object({
  company: z.string().min(1, 'Tên công ty không được để trống'),
  position: z.string().min(1, 'Chức vụ không được để trống'),
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ'),
  endDate: z.string().datetime('Ngày kết thúc không hợp lệ').optional().nullable(),
  isCurrent: z.boolean().optional().default(false),
  description: z.string().optional(),
});

export const updateExperienceSchema = addExperienceSchema.partial();

export const addEducationSchema = z.object({
  school: z.string().min(1, 'Tên trường không được để trống'),
  degree: z.string().min(1, 'Bằng cấp không được để trống'),
  major: z.string().optional(),
  startYear: z.number().int().min(1950).max(2100),
  endYear: z.number().int().min(1950).max(2100).optional().nullable(),
});

export const updateEducationSchema = addEducationSchema.partial();

export const applyJobSchema = z.object({
  jobId: z.string().min(1, 'jobId không được để trống'),
  cvUrl: z.string().url('cvUrl không hợp lệ').optional(),
  coverLetter: z.string().optional(),
});

export const saveJobSchema = z.object({
  jobId: z.string().min(1, 'jobId không được để trống'),
});
