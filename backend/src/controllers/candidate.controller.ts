import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authGuard';
import { candidateService } from '../services/candidate.service';
import * as recommendationService from '../services/recommendation.service';
import {
  updateProfileSchema,
  addExperienceSchema,
  updateExperienceSchema,
  addEducationSchema,
  updateEducationSchema,
  applyJobSchema,
  saveJobSchema,
  createJobAlertSchema,
  updateJobAlertSchema,
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
      const screeningAnswers = Array.isArray(req.body.screeningAnswers)
        ? (req.body.screeningAnswers as unknown[]).filter(
            (a): a is { questionId: string; answer: string } =>
              typeof a === 'object' && a !== null && typeof (a as Record<string, unknown>).questionId === 'string' && typeof (a as Record<string, unknown>).answer === 'string',
          )
        : undefined;
      const candidate = await candidateService.getProfile(req.user!.userId);
      const resolvedCvUrl = cvUrl || candidate.cvUrl;
      if (!resolvedCvUrl) {
        res.status(400).json({ message: 'Vui lòng upload CV trước khi ứng tuyển' });
        return;
      }
      const result = await candidateService.applyJob(req.user!.userId, jobId, resolvedCvUrl, coverLetter, screeningAnswers);
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

  async getJobAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await candidateService.getJobAlerts(req.user!.userId);
      res.json(result);
    } catch (err) { next(err); }
  },

  async createJobAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createJobAlertSchema.parse(req.body);
      const result = await candidateService.createJobAlert(req.user!.userId, data);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async updateJobAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateJobAlertSchema.parse(req.body);
      const result = await candidateService.updateJobAlert(req.user!.userId, String(req.params.alertId), data);
      res.json(result);
    } catch (err) { next(err); }
  },

  async deleteJobAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await candidateService.deleteJobAlert(req.user!.userId, String(req.params.alertId));
      res.json({ message: 'Đã xóa thông báo việc làm' });
    } catch (err) { next(err); }
  },

  async getRecommendedJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(20, parseInt(String(req.query.limit)) || 10);
      const result = await recommendationService.getRecommendedJobs(req.user!.userId, limit);
      res.json(result);
    } catch (err) { next(err); }
  },

  async followCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await candidateService.followCompany(req.user!.userId, String(req.params.employerId));
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async unfollowCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await candidateService.unfollowCompany(req.user!.userId, String(req.params.employerId));
      res.json({ message: 'Đã bỏ theo dõi công ty' });
    } catch (err) { next(err); }
  },

  async getFollowedCompanies(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 12;
      const result = await candidateService.getFollowedCompanies(req.user!.userId, page, limit);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getFollowStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isFollowing = await candidateService.isFollowing(req.user!.userId, String(req.params.employerId));
      res.json({ isFollowing });
    } catch (err) { next(err); }
  },

  async getApplicationTimeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await candidateService.getApplicationTimeline(req.user!.userId, String(req.params.appId));
      res.json(result);
    } catch (err) { next(err); }
  },

  async getCvs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await candidateService.getCvs(req.user!.userId);
      res.json(result);
    } catch (err) { next(err); }
  },

  async uploadCvFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'Vui lòng chọn file CV (PDF)' });
        return;
      }
      const result = await candidateService.uploadCvFile(req.user!.userId, req.file.buffer, req.file.originalname);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async setDefaultCv(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await candidateService.setDefaultCv(req.user!.userId, String(req.params.cvId));
      res.json(result);
    } catch (err) { next(err); }
  },

  async deleteCv(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await candidateService.deleteCv(req.user!.userId, String(req.params.cvId));
      res.json(result);
    } catch (err) { next(err); }
  },

  async updatePublicSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { isPublicProfile, publicSlug } = req.body as { isPublicProfile?: boolean; publicSlug?: string };
      const result = await candidateService.updatePublicSettings(req.user!.userId, { isPublicProfile, publicSlug });
      res.json(result);
    } catch (err) { next(err); }
  },

  async getInterviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await candidateService.getInterviews(req.user!.userId, String(req.params.appId));
      res.json(result);
    } catch (err) { next(err); }
  },

  async respondInterview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const action = String(req.body.action ?? '');
      if (action !== 'confirm' && action !== 'cancel') {
        res.status(400).json({ message: 'action phải là confirm hoặc cancel' });
        return;
      }
      const result = await candidateService.respondInterview(req.user!.userId, String(req.params.appId), String(req.params.interviewId), action);
      res.json(result);
    } catch (err) { next(err); }
  },
};
