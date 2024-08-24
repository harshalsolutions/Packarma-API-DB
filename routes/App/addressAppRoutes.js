import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { addAddressController, getAddressController } from '../../controllers/App/AddressController.js';

const router = express.Router();

router.get('/get-address', getAddressController);
router.post('/add-address', authMiddleware, addAddressController);

export default router;
