import express from 'express';
import {
    createBannerController,
    updateBannerController,
    getBannerController,
    deleteBannerController,
    getAllBannerController,
    getBannerActivityStatsController
} from '../../controllers/Admin/bannerController.js';
import upload from '../../middlewares/multerMiddleware.js';

const router = express.Router();

router.get('/get-banners', getAllBannerController);
router.get('/get-banner/:id', getBannerController);
router.post('/banners', upload.single("banner_image"), createBannerController);
router.put('/update-banner/:id', updateBannerController);
router.delete('/delete-banner/:id', deleteBannerController);

router.get('/activity-log/:bannerId', getBannerActivityStatsController);


export default router;
