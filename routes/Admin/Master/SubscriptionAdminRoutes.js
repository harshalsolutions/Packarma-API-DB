import express from 'express';
import { getAllSubscriptionsController, createSubscriptionController, updateSubscriptionController, deleteSubscriptionController, getAllCurrencyController, addSubscriptionPriceController, updateSubscriptionPriceController, deleteSubscriptionPriceController, getSubscriptionPriceController } from '../../../controllers/Admin/Master/SubscriptionController.js';

const router = express.Router();

router.get('/subscriptions', getAllSubscriptionsController);
router.post('/subscription', createSubscriptionController);
router.put('/subscription/:id', updateSubscriptionController);
router.delete('/subscription/:id', deleteSubscriptionController);

router.get('/subscription/currencies/:id', getAllCurrencyController);

router.get('/subscription/price/:id', getSubscriptionPriceController);
router.post('/subscription/price/:id', addSubscriptionPriceController);
router.put('/subscription/price/:id', updateSubscriptionPriceController);
router.delete('/subscription/price/:id', deleteSubscriptionPriceController);

export default router;
