import express from 'express';
import {
    loginAdminController,
    addAdminController,
    deleteAdminController,
    updateAdminController,
    getAdminController
} from "../../controllers/Admin/authController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/login', loginAdminController);
router.post('/add', addAdminController);
router.delete('/:adminId', deleteAdminController);
router.put('/:adminId', updateAdminController);
router.get('/get-admin', authMiddleware, getAdminController);

export default router;
