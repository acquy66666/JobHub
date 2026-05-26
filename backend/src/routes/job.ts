import { Router } from 'express';
import { jobController } from '../controllers/job.controller';

const router = Router();

router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

export default router;
