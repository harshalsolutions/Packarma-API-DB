import express from 'express';
import { generateInvoiceController } from '../../controllers/App/InvoiceController.js';
const router = express.Router();

router.post('/create-invoice', generateInvoiceController);

export default router;
