import { Router } from 'express';
import { getSubscriptionsController } from '../../controllers/App/subscriptionAndCreditsController.js';

const router = Router();

router.get('/get-subscriptions', getSubscriptionsController);

export default router;
