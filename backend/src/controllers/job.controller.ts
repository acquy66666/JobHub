import { Request, Response, NextFunction } from 'express';
import { jobService } from '../services/job.service';
import { jobQuerySchema } from '../validators/job';

export const jobController = {
  async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const query = jobQuerySchema.parse(req.query);
      const result = await jobService.getJobs(query);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getJobById(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.getJobById(String(req.params.id));
      if (!job) {
        res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
        return;
      }
      res.json(job);
    } catch (err) { next(err); }
  },
};
