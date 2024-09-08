import express from 'express';
const router = express.Router();
import { getSystemDetailsController, updateSystemDetailsController } from '../../../controllers/Admin/ContactUs/SystemDetailsController.js';

router.get('/system-details', getSystemDetailsController);
router.put('/system-details', updateSystemDetailsController);

export default router;