import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authGuard } from '../middlewares/authGuard';
import { roleGuard } from '../middlewares/roleGuard';

const router = Router();

router.use(authGuard, roleGuard('ADMIN'));

router.get('/stats', adminController.getDashboardStats);
router.get('/jobs', adminController.getJobs);
router.patch('/jobs/:jobId/status', adminController.updateJobStatus);
router.get('/users', adminController.getUsers);
router.patch('/users/:userId', adminController.updateUser);

export default router;
