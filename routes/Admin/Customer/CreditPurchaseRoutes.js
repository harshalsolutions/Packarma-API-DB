import express from 'express';
const router = express.Router();
import { exportCreditPurchaseController, getAllCreditPurchaseController } from '../../../controllers/Admin/Customer/CreditPurchaseController.js';

router.get('/credit-purchase', getAllCreditPurchaseController);
router.post('/credit-purchase/export', exportCreditPurchaseController);
export default router;