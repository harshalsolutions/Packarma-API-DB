import express from 'express';
import { getAllReferralsController } from '../../../controllers/Admin/Customer/ReferalController.js';
const router = express.Router();

router.get('/', getAllReferralsController);

export default router;