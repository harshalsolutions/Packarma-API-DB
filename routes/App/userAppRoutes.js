import { Router } from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { addHelpSupportController, freeCreditDocumentController, getUserController, loginController, registerController, authenticateFirebaseController, requestOtpController, requestPasswordResetOtpController, resetPasswordController, updatePasswordController, updateUserController, verifyOtpController } from "../../controllers/App/userController.js"
import upload from '../../middlewares/multerMiddleware.js';

import { getCreditHistory, modifyCredits } from '../../controllers/App/subscriptionAndCreditsController.js';

const router = Router();


router.post('/register', registerController);
router.post('/login', loginController);

router.post('/auth-firebase', authenticateFirebaseController);

router.post('/otp/request', requestOtpController);
router.post('/otp/verify', verifyOtpController);
router.post('/password/otp/request', requestPasswordResetOtpController);
router.post('/password/reset', resetPasswordController);

router.post('/add-help-support', addHelpSupportController);

router.use(authMiddleware);

router.get('/me', getUserController);
router.patch('/update-user', updateUserController);
router.post('/password/update', updatePasswordController);


router.post("/free-credit", upload.single("gst_document"), freeCreditDocumentController)

router.post('/modify-credits', modifyCredits);
router.get('/credit-history', getCreditHistory);




export default router;
