import express from 'express';
const router = express.Router();
import { getAllCreditPurchaseController } from '../../../controllers/Admin/Customer/CreditPurchaseController.js';

router.get('/credit-purchase', getAllCreditPurchaseController);

export default router;