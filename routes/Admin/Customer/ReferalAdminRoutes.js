import express from 'express';
import { getAllReferralsController } from '../../../controllers/Admin/Customer/ReferalController.js';
import { getAllRedeemReferralRequestController, updateRedeemStatusController } from '../../../controllers/Admin/Customer/RedeemReferController.js';
const router = express.Router();

router.get('/referrals', getAllReferralsController);

//Redeem Request Controller Apis
router.get('/redeem-requests', getAllRedeemReferralRequestController);
router.post('/redeem-requests/:id', updateRedeemStatusController);

export default router;