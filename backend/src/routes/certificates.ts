import { Router, Request, Response, NextFunction } from 'express';
import { certificateService } from '../services/certificate.service';
import { searchCertificatesSchema } from '../validators/certificate';

const router = Router();

router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, category, limit } = searchCertificatesSchema.parse(req.query);
    res.json(await certificateService.search(q ?? '', category, limit ?? 20));
  } catch (err) { next(err); }
});

router.get('/by-category', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await certificateService.listByCategory());
  } catch (err) { next(err); }
});

export default router;
