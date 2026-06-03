import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authGuard';
import * as notifService from '../services/notification.service';

export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const result = await notifService.listNotifications(userId, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const count = await notifService.getUnreadCount(req.user!.userId);
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const noti = await notifService.markAsRead(req.user!.userId, String(req.params.id));
    res.json(noti);
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await notifService.markAllAsRead(req.user!.userId);
    res.json({ message: 'Đã đánh dấu tất cả đã đọc' });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await notifService.deleteNotification(req.user!.userId, String(req.params.id));
    res.json({ message: 'Đã xóa thông báo' });
  } catch (err) {
    next(err);
  }
}
