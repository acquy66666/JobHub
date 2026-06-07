import { z } from 'zod';

export const jobQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
  keyword: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']).optional(),
  workMode: z.enum(['ON_SITE', 'REMOTE', 'HYBRID']).optional(),
  salaryMin: z.coerce.number().int().positive().optional(),
  salaryMax: z.coerce.number().int().positive().optional(),
  employerId: z.string().optional(),
  tier: z.enum(['BASIC', 'PREMIUM', 'VIP']).optional(),
  experienceTier: z.enum(['NO_EXP', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD']).optional(),
});
