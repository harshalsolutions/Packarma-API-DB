import express from 'express';
import { getAllUserAddressesController, getAllUsersController } from '../../../controllers/Admin/Customer/UserController.js';

const router = express.Router();

router.get('/', getAllUsersController);
router.get('/addresses', getAllUserAddressesController);

export default router;