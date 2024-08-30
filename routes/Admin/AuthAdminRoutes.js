import express from 'express';
import {
    loginAdminController,
    addAdminController,
    deleteAdminController,
    updateAdminController
} from "../../controllers/Admin/authController.js";

const router = express.Router();

router.post('/login', loginAdminController);
router.post('/add', addAdminController);
router.delete('/:adminId', deleteAdminController);
router.put('/:adminId', updateAdminController);

export default router;
