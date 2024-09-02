import express from 'express';
import { getAllPackingTypesController, createPackingTypeController, updatePackingTypeController, deletePackingTypeController, getPackingTypeController } from '../../../controllers/Admin/Product/PackingTypeController.js';

const router = express.Router();

router.get("/packing-types", getAllPackingTypesController);
router.get("/packing-types/:id", getPackingTypeController);
router.post("/packing-types", createPackingTypeController);
router.put("/packing-types/:id", updatePackingTypeController);
router.delete("/packing-types/:id", deletePackingTypeController);

export default router;
