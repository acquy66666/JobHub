import { prisma } from '../lib/prisma';
import { NotificationType, Prisma } from '../generated/prisma/client';

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });
}

export async function listNotifications(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { notifications, total, totalPages: Math.ceil(total / limit) };
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(userId: string, notificationId: string) {
  const noti = await prisma.notification.findFirst({ where: { id: notificationId, userId } });
  if (!noti) throw Object.assign(new Error('Không tìm thấy thông báo'), { status: 404 });
  return prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}

export async function deleteNotification(userId: string, notificationId: string) {
  const noti = await prisma.notification.findFirst({ where: { id: notificationId, userId } });
  if (!noti) throw Object.assign(new Error('Không tìm thấy thông báo'), { status: 404 });
  return prisma.notification.delete({ where: { id: notificationId } });
}
