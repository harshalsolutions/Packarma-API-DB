import { Router } from 'express';
import authMiddleware from "../../middlewares/authMiddleware.js"
import { CreatePaymentController, VerifyPaymentController } from '../../controllers/App/PaymentController.js';

const router = Router();

router.post('/create-order', authMiddleware, CreatePaymentController);

router.post('/verify-payment', authMiddleware, VerifyPaymentController);

export default router;
