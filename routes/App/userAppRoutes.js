import { Router } from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { freeCreditDocumentController, getUserController, loginController, registerController, requestOtpController, requestPasswordResetOtpController, resetPasswordController, updatePasswordController, updateUserController, verifyOtpController } from "../../controllers/App/userController.js"
import upload from '../../middlewares/multerMiddleware.js';


const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);

router.use(authMiddleware);

router.get('/me', getUserController);
router.put('/update-user', updateUserController);
router.post('/otp/request', requestOtpController);
router.post('/otp/verify', verifyOtpController);
router.post('/password/otp/request', requestPasswordResetOtpController);
router.post('/password/reset', resetPasswordController);
router.post('/password/update', updatePasswordController);

//GST Add Routes

router.post("/free-credit", upload.single("gst_document"), freeCreditDocumentController)



export default router;
