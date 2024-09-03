import express from 'express';
import { getAllMeasurementUnitsController, getMeasurementUnitController, createMeasurementUnitController, updateMeasurementUnitController, deleteMeasurementUnitController } from '../../../controllers/Admin/Product/MeasurementUnitController.js';

const router = express.Router();

router.get("/measurement-units", getAllMeasurementUnitsController);
router.get("/measurement-units/:id", getMeasurementUnitController);
router.post("/measurement-units", createMeasurementUnitController);
router.put("/measurement-units/:id", updateMeasurementUnitController);
router.delete("/measurement-units/:id", deleteMeasurementUnitController);

export default router; 
