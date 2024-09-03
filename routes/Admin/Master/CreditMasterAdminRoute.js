import express from 'express';
import { getCreditMasterController, updateCreditMasterController } from '../../../controllers/Admin/Master/CreditMasterontroller.js';

const router = express.Router();

router.get('/credit-master', getCreditMasterController);
router.post('/credit-master', updateCreditMasterController);

export default router;
