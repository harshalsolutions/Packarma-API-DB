import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { addAddressController, deleteAddressController, getAddressController, updateAddressController } from '../../controllers/App/AddressController.js';

const router = express.Router();

router.get('/get-address', authMiddleware, getAddressController);
router.post('/add-address', authMiddleware, addAddressController);
router.patch('/update-address/:address_id', authMiddleware, updateAddressController);
router.delete('/delete-address/:address_id', authMiddleware, deleteAddressController);

export default router;
