import express from 'express';
const router = express.Router();
import { getPrivacyPolicyController, updatePrivacyPolicyController } from '../../../controllers/Admin/GeneralSettings/PrivacyPolicy.js';

router.get('/privacy-policy', getPrivacyPolicyController);
router.put('/privacy-policy', updatePrivacyPolicyController);

export default router;