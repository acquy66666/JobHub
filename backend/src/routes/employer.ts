import { Router } from 'express';
import { employerController } from '../controllers/employer.controller';
import { authGuard } from '../middlewares/authGuard';
import { roleGuard } from '../middlewares/roleGuard';
import { uploadImage } from '../middlewares/upload';

const router = Router();

// Public — no auth
router.get('/companies', employerController.getPublicList);
router.get('/companies/:employerId', employerController.getPublicCompany);

// Protected — Employer only
router.use(authGuard, roleGuard('EMPLOYER'));

router.get('/profile', employerController.getProfile);
router.put('/profile', uploadImage.single('logo'), employerController.updateProfile);

router.get('/jobs', employerController.getMyJobs);
router.post('/jobs', employerController.createJob);
router.get('/jobs/:jobId', employerController.getJob);
router.put('/jobs/:jobId', employerController.updateJob);
router.delete('/jobs/:jobId', employerController.deleteJob);
router.patch('/jobs/:jobId/status', employerController.toggleJobStatus);

router.get('/jobs/:jobId/applications', employerController.getJobApplications);
router.patch('/jobs/:jobId/applications/:appId', employerController.updateApplicationStatus);
router.patch('/jobs/:jobId/applications/:appId/tag', employerController.updateApplicationTag);

router.get('/templates', employerController.getTemplates);
router.post('/templates', employerController.createTemplate);
router.delete('/templates/:templateId', employerController.deleteTemplate);

router.get('/candidates/search', employerController.searchCandidates);

export default router;
