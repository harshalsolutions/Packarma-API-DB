import { Router } from 'express';
import { checkReferralCodeController, createOrUpdateRedeemRequestController, getUsersByReferralCodeController, updateReferralController } from '../../controllers/App/referralController.js';

const router = Router();

router.get('/get-users/:referralCode', getUsersByReferralCodeController);
router.get('/check-code/:referralCode', checkReferralCodeController);
router.patch('/update-referral-status/:referralCode', updateReferralController);
router.post("/redeem-request", createOrUpdateRedeemRequestController);

export default router;
