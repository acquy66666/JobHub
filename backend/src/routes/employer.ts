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
router.get('/jobs/:jobId/applications/export', employerController.exportApplications);
router.patch('/jobs/:jobId/applications/:appId', employerController.updateApplicationStatus);
router.patch('/jobs/:jobId/applications/:appId/tag', employerController.updateApplicationTag);
router.get('/jobs/:jobId/applications/:appId/notes', employerController.getApplicationNotes);
router.post('/jobs/:jobId/applications/:appId/notes', employerController.createApplicationNote);

router.get('/jobs/:jobId/screening-questions', employerController.getScreeningQuestions);
router.post('/jobs/:jobId/screening-questions', employerController.createScreeningQuestion);
router.delete('/jobs/:jobId/screening-questions/:questionId', employerController.deleteScreeningQuestion);

router.get('/jobs/:jobId/applications/:appId/interviews', employerController.getInterviewsForApp);
router.post('/jobs/:jobId/applications/:appId/interviews', employerController.createInterview);
router.patch('/jobs/:jobId/applications/:appId/interviews/:interviewId', employerController.updateInterview);
router.delete('/jobs/:jobId/applications/:appId/interviews/:interviewId', employerController.deleteInterview);

router.get('/templates', employerController.getTemplates);
router.post('/templates', employerController.createTemplate);
router.delete('/templates/:templateId', employerController.deleteTemplate);

router.get('/job-stats', employerController.getJobStats);
router.get('/candidates/search', employerController.searchCandidates);

export default router;
