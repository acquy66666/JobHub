import { Router, Request, Response, NextFunction } from 'express';
import { authGuard } from '../middlewares/authGuard';
import { roleGuard } from '../middlewares/roleGuard';
import { certificateService } from '../services/certificate.service';
import { CandidateCertificateStatus } from '../generated/prisma/client';
import { adminListCertificatesSchema, adminRejectSchema } from '../validators/certificate';

const router = Router();
router.use(authGuard, roleGuard('ADMIN'));

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page, limit } = adminListCertificatesSchema.parse(req.query);
    res.json(await certificateService.adminList(
      (status ?? 'PENDING') as CandidateCertificateStatus | 'ALL',
      page ?? 1,
      limit ?? 20,
    ));
  } catch (err) { next(err); }
});

router.patch('/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = (req as Request & { userId: string }).userId;
    res.json(await certificateService.approve(adminId, String(req.params.id)));
  } catch (err) { next(err); }
});

router.patch('/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adminNote } = adminRejectSchema.parse(req.body);
    const adminId = (req as Request & { userId: string }).userId;
    res.json(await certificateService.reject(adminId, String(req.params.id), adminNote));
  } catch (err) { next(err); }
});

export default router;
