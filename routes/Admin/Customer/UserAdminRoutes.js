import express from 'express';
import { AddCreditController, getAllUserAddressesController, getAllUsersController, getUserWithAddressController } from '../../../controllers/Admin/Customer/UserController.js';

const router = express.Router();

router.get('/users', getAllUsersController);
router.get('/users/addresses', getAllUserAddressesController);
router.get('/users/addresses/:user_id', getUserWithAddressController);
router.post('/users/add-credit/:user_id', AddCreditController);
export default router;