import { Router, Request, Response, NextFunction } from 'express';
import { candidateService } from '../services/candidate.service';

const router = Router();

router.get('/candidates/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await candidateService.getPublicProfile(String(req.params.slug));
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
