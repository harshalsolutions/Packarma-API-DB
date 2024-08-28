import { Router } from 'express';
import { addUserSubscription, getCreditHistory, getSubscriptionsController, modifyCredits } from '../../controllers/App/subscriptionAndCreditsController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = Router();


router.post('/modify-credits', authMiddleware, modifyCredits);
router.get('/credit-history', authMiddleware, getCreditHistory);

router.get('/get-subscriptions', getSubscriptionsController);
router.post('/add-user-subscription', authMiddleware, addUserSubscription);



export default router;
