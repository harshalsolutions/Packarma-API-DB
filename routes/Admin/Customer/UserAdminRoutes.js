import express from 'express';
import { getAllUserAddressesController, getAllUsersController } from '../../../controllers/Admin/Customer/UserController.js';

const router = express.Router();

router.get('/users', getAllUsersController);
router.get('/users/addresses', getAllUserAddressesController);

export default router;