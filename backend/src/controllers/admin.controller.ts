import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authGuard';
import { adminService } from '../services/admin.service';
import {
  updateUserSchema,
  updateJobStatusSchema,
  adminJobsQuerySchema,
  adminUsersQuerySchema,
  adminReportsQuerySchema,
  updateReportSchema,
  createReportSchema,
  adminLogsQuerySchema,
} from '../validators/admin';
import { Role, AuditAction } from '../generated/prisma/client';
import { logAdminAction } from '../utils/audit';

export const adminController = {
  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getDashboardStats();
      res.json(result);
    } catch (err) { next(err); }
  },

  async getJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, flagged } = adminJobsQuerySchema.parse(req.query);
      const result = await adminService.getJobs(page, limit, status, flagged);
      res.json(result);
    } catch (err) { next(err); }
  },

  async updateJobStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = updateJobStatusSchema.parse(req.body);
      const jobId = String(req.params.jobId);
      const result = await adminService.updateJobStatus(jobId, status);
      logAdminAction(
        req.user!.userId,
        status === 'ACTIVE' ? AuditAction.JOB_APPROVED : AuditAction.JOB_REJECTED,
        'JOB',
        jobId,
        { previousStatus: result.status },
      ).catch(console.error);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, role, keyword } = adminUsersQuerySchema.parse(req.query);
      const result = await adminService.getUsers(page, limit, role as Role | undefined, keyword);
      res.json(result);
    } catch (err) { next(err); }
  },

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateUserSchema.parse(req.body);
      const userId = String(req.params.userId);
      const result = await adminService.updateUser(userId, {
        isActive: data.isActive,
        role: data.role as Role | undefined,
        employerVerified: data.employerVerified,
      });

      let action: AuditAction | undefined;
      if (data.isActive === true) action = AuditAction.USER_UNBANNED;
      else if (data.isActive === false) action = AuditAction.USER_BANNED;
      else if (data.role) action = AuditAction.USER_ROLE_CHANGED;
      else if (data.employerVerified === true) action = AuditAction.EMPLOYER_VERIFIED;
      else if (data.employerVerified === false) action = AuditAction.EMPLOYER_UNVERIFIED;

      if (action) {
        logAdminAction(req.user!.userId, action, 'USER', userId, { ...data }).catch(console.error);
      }
      res.json(result);
    } catch (err) { next(err); }
  },

  async getReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status } = adminReportsQuerySchema.parse(req.query);
      const result = await adminService.getReports(page, limit, status as Parameters<typeof adminService.getReports>[2]);
      res.json(result);
    } catch (err) { next(err); }
  },

  async updateReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateReportSchema.parse(req.body);
      const reportId = String(req.params.reportId);
      const result = await adminService.updateReport(reportId, data);
      logAdminAction(
        req.user!.userId,
        data.status === 'REVIEWED' ? AuditAction.REPORT_REVIEWED : AuditAction.REPORT_DISMISSED,
        'REPORT',
        reportId,
        { adminNote: data.adminNote },
      ).catch(console.error);
      res.json(result);
    } catch (err) { next(err); }
  },

  async createReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createReportSchema.parse(req.body);
      const result = await adminService.createReport(req.user!.userId, data);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async getLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, action } = adminLogsQuerySchema.parse(req.query);
      const result = await adminService.getLogs(page, limit, action as AuditAction | undefined);
      res.json(result);
    } catch (err) { next(err); }
  },
};
