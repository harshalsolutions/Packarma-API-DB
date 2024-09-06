import express from 'express';
const router = express.Router();
import { getAllCustomerEnquiryController } from '../../../controllers/Admin/Customer/CustomerEnquiryController.js';

router.get('/enquiries', getAllCustomerEnquiryController);

export default router;