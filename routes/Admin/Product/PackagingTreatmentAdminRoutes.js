import express from 'express';
import upload from '../../../middlewares/multerMiddleware.js';
import { getAllPackagingTreatmentsController, getPackagingTreatmentController, createPackagingTreatmentController, updatePackagingTreatmentController, deletePackagingTreatmentController } from '../../../controllers/Admin/Product/PackagingTreatmentController.js';
const router = express.Router();

router.get("/packaging-treatment", getAllPackagingTreatmentsController);
router.get("/packaging-treatment/:id", getPackagingTreatmentController);
router.post("/packaging-treatment", upload.single('image'), createPackagingTreatmentController);
router.put("/packaging-treatment/:id", upload.single('image'), updatePackagingTreatmentController);
router.delete("/packaging-treatment/:id", deletePackagingTreatmentController);

export default router;
