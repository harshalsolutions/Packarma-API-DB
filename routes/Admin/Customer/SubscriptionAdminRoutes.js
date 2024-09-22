import express from 'express';
import { getAllSubscriptionController, getAllUserSubscriptionsController } from '../../../controllers/Admin/Customer/UserSubscriptionController.js';
const router = express.Router();

router.get('/subscriptions', getAllUserSubscriptionsController);
router.get('/subscription-list', getAllSubscriptionController);

export default router;