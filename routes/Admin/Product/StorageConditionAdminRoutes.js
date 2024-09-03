import express from 'express';
import { getAllStorageConditionsController, getStorageConditionController, createStorageConditionController, updateStorageConditionController, deleteStorageConditionController } from '../../../controllers/Admin/Product/StorageConditionController.js';

const router = express.Router();

router.get("/storage-conditions", getAllStorageConditionsController);
router.get("/storage-conditions/:id", getStorageConditionController);
router.post("/storage-conditions", createStorageConditionController);
router.put("/storage-conditions/:id", updateStorageConditionController);
router.delete("/storage-conditions/:id", deleteStorageConditionController);

export default router;
