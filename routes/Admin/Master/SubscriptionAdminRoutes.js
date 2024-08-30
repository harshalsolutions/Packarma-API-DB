import express from 'express';
import { getAllSubscriptionsController, createSubscriptionController, updateSubscriptionController, deleteSubscriptionController } from '../../../controllers/Admin/Master/SubscriptionController.js';

const router = express.Router();

router.get('/subscriptions', getAllSubscriptionsController);
router.post('/subscription', createSubscriptionController);
router.put('/subscription/:id', updateSubscriptionController);
router.delete('/subscription/:id', deleteSubscriptionController);

export default router;
