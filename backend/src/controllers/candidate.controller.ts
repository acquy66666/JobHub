import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authGuard';
import { candidateService } from '../services/candidate.service';
import {
  updateProfileSchema,
  addExperienceSchema,
  updateExperienceSchema,
  addEducationSchema,
  updateEducationSchema,
  applyJobSchema,
  saveJobSchema,
} from '../validators/candidate';

export const candidateController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await candidateService.getProfile(req.user!.userId);
      res.json(result);
    } catch (err) { next(err); }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const avatarBuffer = req.file?.buffer;
      const result = await candidateService.updateProfile(req.user!.userId, data, avatarBuffer);
      res.json(result);
    } catch (err) { next(err); }
  },

  async uploadCv(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'Vui lòng chọn file CV (PDF)' });
        return;
      }
      const result = await candidateService.uploadCv(req.user!.userId, req.file.buffer, req.file.originalname);
      res.json(result);
    } catch (err) { next(err); }
  },

  async addExperience(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = addExperienceSchema.parse(req.body);
      const result = await candidateService.addExperience(req.user!.userId, data);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async updateExperience(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateExperienceSchema.parse(req.body);
      const result = await candidateService.updateExperience(req.user!.userId, String(req.params.id), data);
      res.json(result);
    } catch (err) { next(err); }
  },

  async deleteExperience(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await candidateService.deleteExperience(req.user!.userId, String(req.params.id));
      res.json({ message: 'Đã xóa kinh nghiệm' });
    } catch (err) { next(err); }
  },

  async addEducation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = addEducationSchema.parse(req.body);
      const result = await candidateService.addEducation(req.user!.userId, data);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async updateEducation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateEducationSchema.parse(req.body);
      const result = await candidateService.updateEducation(req.user!.userId, String(req.params.id), data);
      res.json(result);
    } catch (err) { next(err); }
  },

  async deleteEducation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await candidateService.deleteEducation(req.user!.userId, String(req.params.id));
      res.json({ message: 'Đã xóa học vấn' });
    } catch (err) { next(err); }
  },

  async applyJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobId, cvUrl, coverLetter } = applyJobSchema.parse(req.body);
      const candidate = await candidateService.getProfile(req.user!.userId);
      const resolvedCvUrl = cvUrl || candidate.cvUrl;
      if (!resolvedCvUrl) {
        res.status(400).json({ message: 'Vui lòng upload CV trước khi ứng tuyển' });
        return;
      }
      const result = await candidateService.applyJob(req.user!.userId, jobId, resolvedCvUrl, coverLetter);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async getMyApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;
      const result = await candidateService.getMyApplications(req.user!.userId, page, limit);
      res.json(result);
    } catch (err) { next(err); }
  },

  async saveJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobId } = saveJobSchema.parse(req.body);
      const result = await candidateService.saveJob(req.user!.userId, jobId);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async unsaveJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await candidateService.unsaveJob(req.user!.userId, String(req.params.jobId));
      res.json({ message: 'Đã bỏ lưu việc làm' });
    } catch (err) { next(err); }
  },

  async getSavedJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;
      const result = await candidateService.getSavedJobs(req.user!.userId, page, limit);
      res.json(result);
    } catch (err) { next(err); }
  },
};
