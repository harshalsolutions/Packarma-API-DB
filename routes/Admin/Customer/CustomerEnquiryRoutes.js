import express from 'express';
const router = express.Router();
import { exportCustomerEnquiryController, getAllCustomerEnquiryController } from '../../../controllers/Admin/Customer/CustomerEnquiryController.js';

router.get('/enquiries', getAllCustomerEnquiryController);
router.post('/enquiries/export', exportCustomerEnquiryController);

export default router;