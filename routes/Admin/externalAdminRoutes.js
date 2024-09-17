import express from 'express';
import { getPrivacyPolicyController, getTermsAndConditionsController, updatePrivacyPolicyController, updateTermsAndConditionsController } from '../../controllers/Admin/ExternalController.js';


const router = express.Router();

router.get('/terms-and-conditons', getTermsAndConditionsController);
router.post('/terms-and-conditons', updateTermsAndConditionsController);
router.get('/privacy-policy', getPrivacyPolicyController);
router.post('/privacy-policy', updatePrivacyPolicyController);

export default router;
