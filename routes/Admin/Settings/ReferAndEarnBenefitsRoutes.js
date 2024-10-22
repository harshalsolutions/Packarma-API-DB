import express from 'express';
const router = express.Router();
import { createBenefitController, deleteBenefitController, getAllBenefitsController } from '../../../controllers/Admin/GeneralSettings/ReferandEarnController.js';

router.get('/refer-earn/benefits', getAllBenefitsController);
router.post('/refer-earn/benefits', createBenefitController);
router.delete('/refer-earn/benefits/:benefit_id', deleteBenefitController);

export default router;