import express from 'express';
import { addStaffController, deleteStaffController, getAllStaffController, updateStaffController } from '../../../controllers/Admin/Staff/StaffController.js';

const router = express.Router();

router.post('/add', addStaffController);
router.delete('/:staffId', deleteStaffController);
router.put('/:staffId', updateStaffController);
router.get('/get-all-staff', getAllStaffController);

export default router;
