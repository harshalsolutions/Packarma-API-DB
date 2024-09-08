import express from 'express';
const router = express.Router();
import { getTermsAndConditionsController, updateTermsAndConditionsController } from '../../../controllers/Admin/GeneralSettings/TermsAndConditions.js';

router.get('/terms-and-conditions', getTermsAndConditionsController);
router.put('/terms-and-conditions', updateTermsAndConditionsController);

export default router;