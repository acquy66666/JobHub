import { Router } from 'express';
import { candidateController } from '../controllers/candidate.controller';
import { authGuard } from '../middlewares/authGuard';
import { roleGuard } from '../middlewares/roleGuard';
import { uploadImage, uploadPdf } from '../middlewares/upload';

const router = Router();

router.use(authGuard, roleGuard('CANDIDATE'));

router.get('/profile', candidateController.getProfile);
router.put('/profile', uploadImage.single('avatar'), candidateController.updateProfile);
router.post('/cv', uploadPdf.single('cv'), candidateController.uploadCv);

router.post('/experience', candidateController.addExperience);
router.put('/experience/:id', candidateController.updateExperience);
router.delete('/experience/:id', candidateController.deleteExperience);

router.post('/education', candidateController.addEducation);
router.put('/education/:id', candidateController.updateEducation);
router.delete('/education/:id', candidateController.deleteEducation);

router.get('/applications', candidateController.getMyApplications);
router.post('/applications', candidateController.applyJob);

router.get('/saved-jobs', candidateController.getSavedJobs);
router.post('/saved-jobs', candidateController.saveJob);
router.delete('/saved-jobs/:jobId', candidateController.unsaveJob);

router.get('/job-alerts', candidateController.getJobAlerts);
router.post('/job-alerts', candidateController.createJobAlert);
router.put('/job-alerts/:alertId', candidateController.updateJobAlert);
router.delete('/job-alerts/:alertId', candidateController.deleteJobAlert);

export default router;
