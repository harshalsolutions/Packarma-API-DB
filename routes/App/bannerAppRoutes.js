import express from 'express';
import { getAllBannerController } from '../../controllers/Admin/bannerController.js';
import { logBannerActivityController } from '../../controllers/App/BannerActivity.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/get-banners', getAllBannerController);
router.patch('/log-activity', authMiddleware, logBannerActivityController);  //add views and click

export default router;
