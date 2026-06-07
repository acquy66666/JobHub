import { prisma } from '../lib/prisma';
import { uploadToCloudinary } from '../lib/cloudinary';
import {
  Prisma,
  CertificateCategory,
  CandidateCertificateStatus,
  NotificationType,
  AuditAction,
  AuditTargetType,
} from '../generated/prisma/client';
import { createNotification } from './notification.service';

const ALLOWED_MIMES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

export const certificateService = {
  async search(q: string, category?: CertificateCategory, limit = 20) {
    const where: Prisma.CertificateWhereInput = {};
    if (category) where.category = category;
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { nameVi: { contains: term, mode: 'insensitive' } },
        { nameEn: { contains: term, mode: 'insensitive' } },
        { issuer: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term.toLowerCase() } },
      ];
    }
    return prisma.certificate.findMany({
      where,
      orderBy: [{ category: 'asc' }, { nameVi: 'asc' }],
      take: limit,
    });
  },

  async listByCategory() {
    const all = await prisma.certificate.findMany({
      orderBy: [{ category: 'asc' }, { nameVi: 'asc' }],
    });
    const grouped: Record<string, typeof all> = {};
    for (const c of all) {
      if (!grouped[c.category]) grouped[c.category] = [];
      grouped[c.category].push(c);
    }
    return grouped;
  },

  async listForCandidate(candidateId: string) {
    return prisma.candidateCertificate.findMany({
      where: { candidateId },
      include: {
        certificate: { select: { slug: true, nameVi: true, nameEn: true, issuer: true, category: true, level: true } },
      },
      orderBy: { uploadedAt: 'desc' },
    });
  },

  async create(
    candidateId: string,
    input: { certificateSlug: string; issuedDate?: string; expiryDate?: string; score?: string },
    file: { buffer: Buffer; originalname: string; mimetype: string }
  ) {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw Object.assign(new Error('Chỉ chấp nhận file PDF, PNG, JPG, WebP'), {
        status: 415,
        code: 'CERTIFICATE_INVALID_MIME',
      });
    }
    const cert = await prisma.certificate.findUnique({ where: { slug: input.certificateSlug } });
    if (!cert) {
      throw Object.assign(new Error('Chứng chỉ không có trong danh mục'), {
        status: 422,
        code: 'CERTIFICATE_INVALID_SLUG',
      });
    }

    const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
    const folder = `jobhub/certificates/${candidateId}`;
    const fileUrl = await uploadToCloudinary(file.buffer, folder, resourceType);

    return prisma.candidateCertificate.create({
      data: {
        candidateId,
        certificateSlug: input.certificateSlug,
        fileUrl,
        fileName: file.originalname,
        fileMime: file.mimetype,
        issuedDate: input.issuedDate ? new Date(input.issuedDate) : null,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        score: input.score ?? null,
        status: 'PENDING',
      },
      include: { certificate: true },
    });
  },

  async update(
    candidateId: string,
    id: string,
    data: { issuedDate?: string | null; expiryDate?: string | null; score?: string | null }
  ) {
    const cc = await prisma.candidateCertificate.findFirst({ where: { id, candidateId } });
    if (!cc) throw Object.assign(new Error('Không tìm thấy chứng chỉ'), { status: 404, code: 'CERTIFICATE_NOT_FOUND' });
    if (cc.status !== 'PENDING') {
      throw Object.assign(new Error('Chỉ chỉnh sửa được khi đang chờ duyệt'), {
        status: 409,
        code: 'CERTIFICATE_NOT_PENDING',
      });
    }
    return prisma.candidateCertificate.update({
      where: { id },
      data: {
        issuedDate: data.issuedDate === null ? null : data.issuedDate ? new Date(data.issuedDate) : undefined,
        expiryDate: data.expiryDate === null ? null : data.expiryDate ? new Date(data.expiryDate) : undefined,
        score: data.score === null ? null : data.score ?? undefined,
      },
    });
  },

  async remove(candidateId: string, id: string) {
    const cc = await prisma.candidateCertificate.findFirst({ where: { id, candidateId } });
    if (!cc) throw Object.assign(new Error('Không tìm thấy chứng chỉ'), { status: 404, code: 'CERTIFICATE_NOT_FOUND' });
    await prisma.candidateCertificate.delete({ where: { id } });
    return { ok: true };
  },

  async adminList(status: CandidateCertificateStatus | 'ALL' = 'PENDING', page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.CandidateCertificateWhereInput = status === 'ALL' ? {} : { status };
    const [items, total] = await Promise.all([
      prisma.candidateCertificate.findMany({
        where,
        include: {
          certificate: { select: { slug: true, nameVi: true, nameEn: true, issuer: true, category: true } },
          candidate: { select: { id: true, fullName: true, user: { select: { email: true } } } },
        },
        orderBy: { uploadedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.candidateCertificate.count({ where }),
    ]);
    return { items, total, totalPages: Math.ceil(total / limit) };
  },

  async approve(adminId: string, id: string) {
    const cc = await prisma.candidateCertificate.findUnique({
      where: { id },
      include: { candidate: { select: { userId: true } }, certificate: { select: { nameVi: true } } },
    });
    if (!cc) throw Object.assign(new Error('Không tìm thấy chứng chỉ'), { status: 404, code: 'CERTIFICATE_NOT_FOUND' });

    await prisma.$transaction([
      prisma.candidateCertificate.update({
        where: { id },
        data: { status: 'APPROVED', reviewedAt: new Date(), reviewedBy: adminId, adminNote: null },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: AuditAction.CERTIFICATE_APPROVE,
          targetType: AuditTargetType.CANDIDATE_CERTIFICATE,
          targetId: id,
        },
      }),
    ]);

    await createNotification({
      userId: cc.candidate.userId,
      type: NotificationType.CERTIFICATE_APPROVED,
      title: 'Chứng chỉ đã được duyệt',
      message: `"${cc.certificate.nameVi}" đã được duyệt và hiển thị trong hồ sơ.`,
      link: '/candidate/profile',
      metadata: { certificateId: id },
    });

    return { ok: true };
  },

  async reject(adminId: string, id: string, adminNote: string) {
    const cc = await prisma.candidateCertificate.findUnique({
      where: { id },
      include: { candidate: { select: { userId: true } }, certificate: { select: { nameVi: true } } },
    });
    if (!cc) throw Object.assign(new Error('Không tìm thấy chứng chỉ'), { status: 404, code: 'CERTIFICATE_NOT_FOUND' });

    await prisma.$transaction([
      prisma.candidateCertificate.update({
        where: { id },
        data: { status: 'REJECTED', reviewedAt: new Date(), reviewedBy: adminId, adminNote },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: AuditAction.CERTIFICATE_REJECT,
          targetType: AuditTargetType.CANDIDATE_CERTIFICATE,
          targetId: id,
          metadata: { note: adminNote },
        },
      }),
    ]);

    await createNotification({
      userId: cc.candidate.userId,
      type: NotificationType.CERTIFICATE_REJECTED,
      title: 'Chứng chỉ bị từ chối',
      message: `"${cc.certificate.nameVi}" bị từ chối: ${adminNote}`,
      link: '/candidate/profile',
      metadata: { certificateId: id, note: adminNote },
    });

    return { ok: true };
  },
};
