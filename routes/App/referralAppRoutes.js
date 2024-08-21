import { Router } from 'express';
import { checkReferralCodeController, getUsersByReferralCodeController, updateReferralController } from '../../controllers/App/referralController.js';
const router = Router();

router.get('/get-users/:referralCode', getUsersByReferralCodeController);
router.get('/check-code/:referralCode', checkReferralCodeController);
router.patch('/update-referral-status/:referralCode', updateReferralController);

export default router;
