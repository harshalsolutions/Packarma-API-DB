import { Router } from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { getUserController, loginController, registerController, requestOtpController, requestPasswordResetOtpController, resetPasswordController, updateUserController, verifyOtpController } from "../../controllers/App/userController.js"
const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);

router.use(authMiddleware);

router.get('/me', getUserController);
router.put('/me', updateUserController);
router.post('/otp/request', requestOtpController);
router.post('/otp/verify', verifyOtpController);
router.post('/password/otp/request', requestPasswordResetOtpController);
router.post('/password/reset', resetPasswordController);

export default router;
