import express from 'express';
import { addCreditInvoiceController, addSubscriptionInvoiceController, generateInvoiceController, getCreditInvoicesController, getSubscriptionInvoicesController } from '../../controllers/App/InvoiceController.js';
import authMiddleware from "../../middlewares/authMiddleware.js"
const router = express.Router();

router.post('/create-invoice', generateInvoiceController);

router.get('/credit/get-invoices', authMiddleware, getCreditInvoicesController);
router.get('/subscription/get-invoices', authMiddleware, getSubscriptionInvoicesController);

router.post('/credit/add-invoice', authMiddleware, addCreditInvoiceController);
router.post('/subscription/add-invoice', authMiddleware, addSubscriptionInvoiceController);

export default router;
