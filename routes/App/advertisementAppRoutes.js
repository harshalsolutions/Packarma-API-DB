import express from 'express';
import { getAllAdvertisementController } from "../../controllers/Admin/Master/advertisementController.js"
import authMiddleware from '../../middlewares/authMiddleware.js';
import { logAdvertisementActivityController } from '../../controllers/App/AdvertisementActivity.js';

const router = express.Router();

router.get('/get-advertisements', getAllAdvertisementController);
router.patch('/log-activity', authMiddleware, logAdvertisementActivityController);  //add views and click

export default router;
