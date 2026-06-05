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
      const status = req.query.status ? String(req.query.status) : undefined;
      const tag = req.query.tag ? String(req.query.tag) : undefined;
      const result = await employerService.getJobApplications(req.user!.userId, String(req.params.jobId), page, limit, status, tag);
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

  async getApplicationNotes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employerService.getApplicationNotes(
        req.user!.userId,
        String(req.params.jobId),
        String(req.params.appId),
      );
      res.json(result);
    } catch (err) { next(err); }
  },

  async createApplicationNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const content = String(req.body.content ?? '').trim();
      if (!content) { res.status(400).json({ message: 'Nội dung ghi chú không được trống' }); return; }
      const result = await employerService.createApplicationNote(
        req.user!.userId,
        String(req.params.jobId),
        String(req.params.appId),
        content,
      );
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async exportApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { csv, jobTitle } = await employerService.exportApplicationsCsv(
        req.user!.userId,
        String(req.params.jobId),
      );
      const filename = `ung-vien-${String(req.params.jobId).slice(0, 8)}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send('﻿' + csv);
      void jobTitle;
    } catch (err) { next(err); }
  },

  async searchCandidates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const skill = req.query.skill ? String(req.query.skill).trim() : undefined;
      const location = req.query.location ? String(req.query.location).trim() : undefined;
      const headline = req.query.headline ? String(req.query.headline).trim() : undefined;
      const page = Math.max(1, parseInt(String(req.query.page)) || 1);
      const limit = Math.min(20, Math.max(1, parseInt(String(req.query.limit)) || 12));
      const result = await employerService.searchCandidates({ skill, location, headline, page, limit });
      res.json(result);
    } catch (err) { next(err); }
  },

  async getJobStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employerService.getJobStats(req.user!.userId);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getRecentApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const statusRaw = typeof req.query.status === 'string' ? req.query.status : undefined;
      const limit = Math.min(20, Math.max(1, parseInt(String(req.query.limit ?? '5'), 10) || 5));
      const result = await employerService.getRecentApplications(req.user!.userId, {
        status: statusRaw as never,
        limit,
      });
      res.json(result);
    } catch (err) { next(err); }
  },

  async getAllApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(String(req.query.page)) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit)) || 20));
      const jobId = typeof req.query.jobId === 'string' && req.query.jobId ? req.query.jobId : undefined;
      const status = typeof req.query.status === 'string' && req.query.status ? req.query.status : undefined;
      const tag = typeof req.query.tag === 'string' && req.query.tag ? req.query.tag : undefined;
      const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : undefined;
      const result = await employerService.getAllApplications(req.user!.userId, {
        jobId, status, tag, keyword: keyword || undefined, page, limit,
      });
      res.json(result);
    } catch (err) { next(err); }
  },

  async getSalaryBenchmark(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const title = typeof req.query.title === 'string' ? req.query.title.trim() : '';
      const industry = typeof req.query.industry === 'string' ? req.query.industry.trim() : '';
      if (!title && !industry) {
        res.status(400).json({ message: 'Cần ít nhất title hoặc industry' });
        return;
      }
      const result = await employerService.getSalaryBenchmark({
        title: title || undefined,
        industry: industry || undefined,
      });
      res.json(result);
    } catch (err) { next(err); }
  },

  async getScreeningQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employerService.getScreeningQuestions(req.user!.userId, String(req.params.jobId));
      res.json(result);
    } catch (err) { next(err); }
  },

  async createScreeningQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const question = String(req.body.question ?? '').trim();
      if (!question) { res.status(400).json({ message: 'Nội dung câu hỏi không được trống' }); return; }
      const type = String(req.body.type ?? 'TEXT');
      const isRequired = req.body.isRequired !== false;
      const result = await employerService.createScreeningQuestion(req.user!.userId, String(req.params.jobId), { question, type, isRequired });
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async deleteScreeningQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await employerService.deleteScreeningQuestion(req.user!.userId, String(req.params.jobId), String(req.params.questionId));
      res.json({ message: 'Đã xóa câu hỏi' });
    } catch (err) { next(err); }
  },

  async getInterviewsForApp(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await employerService.getInterviewsForApp(req.user!.userId, String(req.params.jobId), String(req.params.appId));
      res.json(result);
    } catch (err) { next(err); }
  },

  async createInterview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { scheduledAt, location, meetingLink, note } = req.body;
      if (!scheduledAt) { res.status(400).json({ message: 'Vui lòng chọn thời gian phỏng vấn' }); return; }
      const result = await employerService.createInterview(req.user!.userId, String(req.params.jobId), String(req.params.appId), { scheduledAt, location, meetingLink, note });
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async updateInterview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { scheduledAt, location, meetingLink, note } = req.body;
      const result = await employerService.updateInterview(req.user!.userId, String(req.params.jobId), String(req.params.appId), String(req.params.interviewId), { scheduledAt, location, meetingLink, note });
      res.json(result);
    } catch (err) { next(err); }
  },

  async deleteInterview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await employerService.deleteInterview(req.user!.userId, String(req.params.jobId), String(req.params.appId), String(req.params.interviewId));
      res.json({ message: 'Đã xóa lịch phỏng vấn' });
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
