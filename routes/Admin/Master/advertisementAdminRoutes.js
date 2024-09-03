import express from 'express';
import {
    createAdvertisementController,
    updateAdvertisementController,
    getAdvertisementController,
    deleteAdvertisementController,
    getAllAdvertisementController,
    getAdvertisementActivityStatsController,
} from '../../../controllers/Admin/Master/advertisementController.js';
import upload from '../../../middlewares/multerMiddleware.js';

const router = express.Router();

router.get('/get-advertisements', getAllAdvertisementController);
router.get('/get-advertisement/:id', getAdvertisementController);
router.post('/add-advertisement', upload.single("advertisement_image"), createAdvertisementController);
router.patch('/update-advertisement/:id', upload.single("advertisement_image"), updateAdvertisementController);
router.delete('/delete-advertisement/:id', deleteAdvertisementController);

router.get('/activity-log/:id', getAdvertisementActivityStatsController);

export default router;
