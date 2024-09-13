import { Router } from 'express';
import { getAboutUsController, getPrivacyPolicyController, getTermsAndConditionController } from '../../controllers/App/AppDataController.js';

const router = Router();

router.get('/terms-and-conditions', getTermsAndConditionController);
router.get('/privacy-policy', getPrivacyPolicyController);
router.get('/about-us', getAboutUsController);

export default router;
