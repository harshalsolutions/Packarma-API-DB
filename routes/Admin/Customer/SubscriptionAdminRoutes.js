import express from 'express';
import { getAllUserSubscriptionsController } from '../../../controllers/Admin/Customer/UserSubscriptionController.js';
const router = express.Router();

router.get('/subscriptions', getAllUserSubscriptionsController);

export default router;