import express from 'express';
import { AddCreditController, exportUsersDataController, getAllUserAddressesController, getAllUsersController, getUserWithAddressController, updateUserDetailsController } from '../../../controllers/Admin/Customer/UserController.js';

const router = express.Router();

router.get('/users', getAllUsersController);
router.get('/users/addresses', getAllUserAddressesController);
router.get('/users/addresses/:user_id', getUserWithAddressController);
router.post('/users/add-credit/:user_id', AddCreditController);
router.post('/users/export', exportUsersDataController);

router.post("/users/update/:id", updateUserDetailsController)

export default router;