import express from 'express';
const router = express.Router();
import { getTermsAndConditionsController, updateTermsAndConditionsController } from '../../../controllers/Admin/GeneralSettings/TermsAndConditions.js';

router.get('about-us', getTermsAndConditionsController);
router.put('about-us', updateTermsAndConditionsController);

export default router;