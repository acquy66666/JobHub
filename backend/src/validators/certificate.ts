import { z } from 'zod';
import { CertificateCategory } from '../generated/prisma/client';

export const searchCertificatesSchema = z.object({
  q: z.string().optional(),
  category: z.nativeEnum(CertificateCategory).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const createCandidateCertificateSchema = z.object({
  certificateSlug: z.string().min(1),
  issuedDate: z.string().datetime().optional().or(z.literal('').transform(() => undefined)),
  expiryDate: z.string().datetime().optional().or(z.literal('').transform(() => undefined)),
  score: z.string().max(60).optional(),
});

export const updateCandidateCertificateSchema = z.object({
  issuedDate: z.string().datetime().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  score: z.string().max(60).optional().nullable(),
});

export const adminListCertificatesSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ALL']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const adminRejectSchema = z.object({
  adminNote: z.string().min(1, 'Vui lòng nhập lý do từ chối'),
});
