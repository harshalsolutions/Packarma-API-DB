import express from 'express';
const router = express.Router();
import { getCustomerCareController } from '../../../controllers/Admin/ContactUs/CustomerCareController.js';

router.get('/customer-care', getCustomerCareController);

export default router;