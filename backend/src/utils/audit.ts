import { prisma } from '../lib/prisma';
import { AuditAction, AuditTargetType, Prisma } from '../generated/prisma/client';

export async function logAdminAction(
  adminId: string,
  action: AuditAction,
  targetType: AuditTargetType,
  targetId: string,
  metadata?: Record<string, unknown>,
) {
  await prisma.auditLog.create({
    data: {
      id: crypto.randomUUID(),
      adminId,
      action,
      targetType,
      targetId,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });
}
