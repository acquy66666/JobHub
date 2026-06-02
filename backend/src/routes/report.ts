import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authGuard } from '../middlewares/authGuard';

const router = Router();

router.use(authGuard);
router.post('/', adminController.createReport);

export default router;
