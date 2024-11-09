import { Router } from "express";
import {
  getAboutUsController,
  getPrivacyPolicyController,
  getReferAndEarnBenefitsController,
  getReferAndEarnTAndCController,
  getTermsAndConditionController,
} from "../../controllers/App/AppDataController.js";
import { getCreditPricesController } from "../../controllers/App/CreditController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/terms-and-conditions",
  authMiddleware,
  getTermsAndConditionController
);
router.get("/privacy-policy", authMiddleware, getPrivacyPolicyController);
router.get("/about-us", authMiddleware, getAboutUsController);
router.get(
  "/refer-and-earn/terms-and-condition",
  authMiddleware,
  getReferAndEarnTAndCController
);
router.get(
  "/refer-and-earn/benefits",
  authMiddleware,
  getReferAndEarnBenefitsController
);

router.get("/credit-prices", authMiddleware, getCreditPricesController);

export default router;
