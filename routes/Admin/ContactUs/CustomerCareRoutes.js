import express from 'express';
const router = express.Router();
import { getCustomerCareController, updateAdminDescriptionForEnquiryController } from '../../../controllers/Admin/ContactUs/CustomerCareController.js';

router.get('/customer-care', getCustomerCareController);
router.post('/add-description/:id', updateAdminDescriptionForEnquiryController);

export default router;