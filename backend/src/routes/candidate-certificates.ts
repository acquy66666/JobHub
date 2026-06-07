import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authGuard } from '../middlewares/authGuard';
import { roleGuard } from '../middlewares/roleGuard';
import { prisma } from '../lib/prisma';
import { certificateService } from '../services/certificate.service';
import { createCandidateCertificateSchema, updateCandidateCertificateSchema } from '../validators/certificate';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(Object.assign(new Error('Chỉ chấp nhận PDF, PNG, JPG, WebP'), { status: 415, code: 'CERTIFICATE_INVALID_MIME' }) as unknown as null, false);
  },
});

const router = Router();
router.use(authGuard, roleGuard('CANDIDATE'));

async function resolveCandidateId(userId: string): Promise<string> {
  const c = await prisma.candidate.findUnique({ where: { userId }, select: { id: true } });
  if (!c) throw Object.assign(new Error('Không tìm thấy hồ sơ'), { status: 404 });
  return c.id;
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = await resolveCandidateId(((req as Request & { user?: { userId: string } }).user?.userId ?? ''));
    res.json(await certificateService.listForCandidate(candidateId));
  } catch (err) { next(err); }
});

router.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw Object.assign(new Error('Thiếu file'), { status: 400 });
    const data = createCandidateCertificateSchema.parse(req.body);
    const candidateId = await resolveCandidateId(((req as Request & { user?: { userId: string } }).user?.userId ?? ''));
    const created = await certificateService.create(candidateId, data, {
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
    });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateCandidateCertificateSchema.parse(req.body);
    const candidateId = await resolveCandidateId(((req as Request & { user?: { userId: string } }).user?.userId ?? ''));
    res.json(await certificateService.update(candidateId, String(req.params.id), data));
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = await resolveCandidateId(((req as Request & { user?: { userId: string } }).user?.userId ?? ''));
    res.json(await certificateService.remove(candidateId, String(req.params.id)));
  } catch (err) { next(err); }
});

export default router;
