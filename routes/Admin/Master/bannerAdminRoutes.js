import express from 'express';
import {
    createBannerController,
    updateBannerController,
    getBannerController,
    deleteBannerController,
    getAllBannerController,
    getBannerActivityStatsController
} from '../../../controllers/Admin/Master/bannerController.js';
import upload from "../../../middlewares/multerMiddleware.js"
const router = express.Router();

router.get('/get-banners', getAllBannerController);
router.get('/get-banner/:id', getBannerController);
router.post('/add-banner', upload.single("banner"), createBannerController);
router.put('/update-banner/:id', upload.single("banner"), updateBannerController);
router.delete('/delete-banner/:id', deleteBannerController);

router.get('/activity-log/:id', getBannerActivityStatsController);


export default router;
