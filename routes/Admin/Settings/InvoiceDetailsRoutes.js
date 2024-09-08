import express from 'express';
const router = express.Router();
import { getInvoiceDetailsController, updateInvoiceDetailsController } from '../../../controllers/Admin/GeneralSettings/InvoiceDetailsController.js';

router.get('/invoice-details', getInvoiceDetailsController);
router.put('/invoice-details', updateInvoiceDetailsController);

export default router;