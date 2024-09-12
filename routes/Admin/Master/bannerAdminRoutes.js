import express from 'express';
import {
    createBannerController,
    updateBannerController,
    deleteBannerController,
    getAllBannerController,
    getBannerActivityStatsController,
    exportBannerControllerById
} from '../../../controllers/Admin/Master/bannerController.js';
import upload from "../../../middlewares/multerMiddleware.js"
const router = express.Router();

router.get('/get-banners', getAllBannerController);
router.get('/export-banner/:id', exportBannerControllerById);
router.post('/add-banner', upload.single("banner"), createBannerController);
router.put('/update-banner/:id', upload.single("banner"), updateBannerController);
router.delete('/delete-banner/:id', deleteBannerController);

router.get('/banner/activity-log/:id', getBannerActivityStatsController);


export default router;
