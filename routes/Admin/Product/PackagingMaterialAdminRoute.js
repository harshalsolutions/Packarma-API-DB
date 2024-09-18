import express from 'express';
import { getAllPackagingMaterialsController, getPackagingMaterialController, createPackagingMaterialController, updatePackagingMaterialController, deletePackagingMaterialController, exportAllMaterialsController } from '../../../controllers/Admin/Product/PackagingMaterial.js';

const router = express.Router();

router.get("/packaging-materials", getAllPackagingMaterialsController);
router.get("/packaging-materials/:id", getPackagingMaterialController);
router.post("/packaging-materials", createPackagingMaterialController);
router.put("/packaging-materials/:id", updatePackagingMaterialController);
router.delete("/packaging-materials/:id", deletePackagingMaterialController);
router.post("/packaging-materials/export", exportAllMaterialsController);

export default router;
