import { Router } from 'express';
import { addFreeTrailController, getSubscriptionsController } from '../../controllers/App/subscriptionAndCreditsController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
const router = Router();

router.get('/get-subscriptions', getSubscriptionsController);
router.get('/add-free-trial', authMiddleware, addFreeTrailController);

export default router;
