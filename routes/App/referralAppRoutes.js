import { Router } from "express";
import {
  checkReferralCodeController,
  createOrUpdateRedeemRequestController,
  getUsersByReferralCodeController,
  updateReferralController,
} from "../../controllers/App/referralController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/get-users/:referralCode",
  authMiddleware,
  getUsersByReferralCodeController
);
router.get(
  "/check-code/:referralCode",
  authMiddleware,
  checkReferralCodeController
);
router.patch(
  "/update-referral-status/:referralCode",
  authMiddleware,
  updateReferralController
);
router.post(
  "/redeem-request",
  authMiddleware,
  createOrUpdateRedeemRequestController
);

export default router;
