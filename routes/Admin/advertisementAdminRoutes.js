import express from 'express';
import {
    createAdvertisementController,
    updateAdvertisementController,
    getAdvertisementController,
    deleteAdvertisementController,
    getAllAdvertisementController,
    getAdvertisementActivityStatsController,
} from '../../controllers/Admin/advertisementController.js';
import upload from '../../middlewares/multerMiddleware.js';

const router = express.Router();

router.get('/get-advertisements', getAllAdvertisementController);
router.get('/get-advertisement/:id', getAdvertisementController);
router.post('/add-advertisement', upload.single("image"), createAdvertisementController);
router.put('/update-advertisement/:id', updateAdvertisementController);
router.delete('/delete-advertisement/:id', deleteAdvertisementController);

router.get('/activity-log/:advertisementId', getAdvertisementActivityStatsController);

export default router;
