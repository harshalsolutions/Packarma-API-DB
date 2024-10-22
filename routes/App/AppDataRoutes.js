import { Router } from 'express';
import { getAboutUsController, getPrivacyPolicyController, getReferAndEarnBenefitsController, getReferAndEarnTAndCController, getTermsAndConditionController } from '../../controllers/App/AppDataController.js';
import { getCreditPricesController } from '../../controllers/App/CreditController.js';

const router = Router();

router.get('/terms-and-conditions', getTermsAndConditionController);
router.get('/privacy-policy', getPrivacyPolicyController);
router.get('/about-us', getAboutUsController);
router.get('/refer-and-earn/terms-and-condition', getReferAndEarnTAndCController);
router.get('/refer-and-earn/benefits', getReferAndEarnBenefitsController);


router.get('/credit-prices', getCreditPricesController);

export default router;
