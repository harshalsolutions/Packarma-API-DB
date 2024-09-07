import express from 'express';

import {
    getPermissionController,
    updatePermissionController,
    deletePermissionController,
    addPermissionController,
    getAllPermissionsController
} from "../../../controllers/Admin/Staff/PermissionController.js";

const router = express.Router();


router.post('/permissions', addPermissionController);
router.get('/permissions', getAllPermissionsController);
router.get('/permissions/:permissionId', getPermissionController);
router.put('/permissions/:permissionId', updatePermissionController);
router.delete('/permissions/:permissionId', deletePermissionController);

export default router;
