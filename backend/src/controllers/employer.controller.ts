import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authGuard';
import { employerService } from '../services/employer.service';
import {
  updateProfileSchema,
  createJobSchema,
  updateJobSchema,
  updateApplicationStatusSchema,
  updateApplicationTagSchema,
} from '../validators/employer';

export const employerController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employerService.getProfile(req.user!.userId);
      res.json(result);
    } catch (err) { next(err); }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const logoBuffer = req.file?.buffer;
      const result = await employerService.updateProfile(req.user!.userId, data, logoBuffer);
      res.json(result);
    } catch (err) { next(err); }
  },

  async createJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createJobSchema.parse(req.body);
      const result = await employerService.createJob(req.user!.userId, data);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async getMyJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;
      const result = await employerService.getMyJobs(req.user!.userId, page, limit);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employerService.getJob(req.user!.userId, String(req.params.jobId));
      res.json(result);
    } catch (err) { next(err); }
  },

  async updateJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateJobSchema.parse(req.body);
      const result = await employerService.updateJob(req.user!.userId, String(req.params.jobId), data);
      res.json(result);
    } catch (err) { next(err); }
  },

  async deleteJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await employerService.deleteJob(req.user!.userId, String(req.params.jobId));
      res.json({ message: 'Đã xóa tin tuyển dụng' });
    } catch (err) { next(err); }
  },

  async toggleJobStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { action } = req.body as { action: 'pause' | 'resume' };
      if (!['pause', 'resume'].includes(action)) {
        res.status(400).json({ message: 'action phải là pause hoặc resume' });
        return;
      }
      const result = await employerService.toggleJobStatus(req.user!.userId, String(req.params.jobId), action);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getJobApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;
      const result = await employerService.getJobApplications(req.user!.userId, String(req.params.jobId), page, limit);
      res.json(result);
    } catch (err) { next(err); }
  },

  async updateApplicationStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, note } = updateApplicationStatusSchema.parse(req.body);
      const result = await employerService.updateApplicationStatus(
        req.user!.userId,
        String(req.params.jobId),
        String(req.params.appId),
        status as import('../generated/prisma/client').ApplicationStatus,
        note,
      );
      res.json(result);
    } catch (err) { next(err); }
  },

  async updateApplicationTag(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { tag } = updateApplicationTagSchema.parse(req.body);
      const result = await employerService.updateApplicationTag(
        req.user!.userId,
        String(req.params.jobId),
        String(req.params.appId),
        tag as import('../generated/prisma/client').ApplicationTag | null,
      );
      res.json(result);
    } catch (err) { next(err); }
  },

  async getTemplates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employerService.getTemplates(req.user!.userId);
      res.json(result);
    } catch (err) { next(err); }
  },

  async createTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employerService.createTemplate(req.user!.userId, req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async deleteTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await employerService.deleteTemplate(req.user!.userId, String(req.params.templateId));
      res.json({ message: 'Đã xóa template' });
    } catch (err) { next(err); }
  },

  async getPublicList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const result = await employerService.getPublicList(page, limit);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getPublicCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employerService.getPublicCompany(String(req.params.employerId));
      res.json(result);
    } catch (err) { next(err); }
  },
};
