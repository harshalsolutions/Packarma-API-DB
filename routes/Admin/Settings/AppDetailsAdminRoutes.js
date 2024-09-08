import express from 'express';
const router = express.Router();
import { getAppDetailsController, updateAppDetailsController } from '../../../controllers/Admin/GeneralSettings/AppDetailsController.js';

router.get('/app-details', getAppDetailsController);
router.put('/app-details', updateAppDetailsController);

export default router;