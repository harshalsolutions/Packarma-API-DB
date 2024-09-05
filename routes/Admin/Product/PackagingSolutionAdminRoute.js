import express from 'express';
import { getAllPackagingSolutionsController, getPackagingSolutionController, createPackagingSolutionController, updatePackagingSolutionController, deletePackagingSolutionController } from '../../../controllers/Admin/Product/PackagingSolutionController.js';
const router = express.Router();

router.get("/packaging-solutions", getAllPackagingSolutionsController);
router.get("/packaging-solutions/:id", getPackagingSolutionController);
router.post("/packaging-solutions", createPackagingSolutionController);
router.put("/packaging-solutions/:id", updatePackagingSolutionController);
router.delete("/packaging-solutions/:id", deletePackagingSolutionController);

export default router;
