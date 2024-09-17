import express from 'express';
import { createCreditPriceController, deleteCreditPriceController, getAllCreditPricesController, getAllCurrencyController, updateCreditPriceController } from '../../../controllers/Admin/Master/CreditMasterontroller.js';

const router = express.Router();

router.get('/credit-prices', getAllCreditPricesController);
router.post('/credit-prices', createCreditPriceController);
router.put('/credit-prices/:id', updateCreditPriceController);
router.delete('/credit-prices/:id', deleteCreditPriceController);

router.get("/currencies", getAllCurrencyController)

export default router;
