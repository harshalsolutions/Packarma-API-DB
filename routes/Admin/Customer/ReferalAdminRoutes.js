import express from 'express';
import { getAllReferralsController } from '../../../controllers/Admin/Customer/ReferalController.js';
const router = express.Router();

router.get('/referrals', getAllReferralsController);

export default router;