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
} from '../validators/admin';
import { Role } from '../generated/prisma/client';

export const adminController = {
  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getDashboardStats();
      res.json(result);
    } catch (err) { next(err); }
  },

  async getJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status } = adminJobsQuerySchema.parse(req.query);
      const result = await adminService.getJobs(page, limit, status);
      res.json(result);
    } catch (err) { next(err); }
  },

  async updateJobStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = updateJobStatusSchema.parse(req.body);
      const result = await adminService.updateJobStatus(String(req.params.jobId), status);
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
      const result = await adminService.updateUser(String(req.params.userId), {
        isActive: data.isActive,
        role: data.role as Role | undefined,
        employerVerified: data.employerVerified,
      });
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
      const result = await adminService.updateReport(String(req.params.reportId), data);
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
};
