import express from 'express';
import { getAllPackagingSolutionsController, getPackagingSolutionController, createPackagingSolutionController, updatePackagingSolutionController, deletePackagingSolutionController, exportAllPackagingSolutionController } from '../../../controllers/Admin/Product/PackagingSolutionController.js';
import upload from '../../../middlewares/multerMiddleware.js';
const router = express.Router();

router.get("/packaging-solutions", getAllPackagingSolutionsController);
router.get("/packaging-solutions/:id", getPackagingSolutionController);
router.post("/packaging-solutions", upload.single('image'), createPackagingSolutionController);
router.put("/packaging-solutions/:id", upload.single('image'), updatePackagingSolutionController);
router.delete("/packaging-solutions/:id", deletePackagingSolutionController);

router.post("/export-packaging-solutions", exportAllPackagingSolutionController);


export default router;
