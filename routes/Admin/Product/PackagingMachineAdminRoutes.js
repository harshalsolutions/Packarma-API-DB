import express from 'express';
import { createPackagingMachineController, deletePackagingMachineController, getAllPackagingMachineController, getPackagingMachineController, updatePackagingMachineController } from '../../../controllers/Admin/Product/PackagingMachineController.js';
import upload from '../../../middlewares/multerMiddleware.js';

const router = express.Router();

router.get("/packaging-machines", getAllPackagingMachineController);
router.get("/packaging-machines/:id", getPackagingMachineController);
router.post("/packaging-machines", upload.single('image'), createPackagingMachineController);
router.put("/packaging-machines/:id", upload.single('image'), updatePackagingMachineController);
router.delete("/packaging-machines/:id", deletePackagingMachineController);

export default router;
