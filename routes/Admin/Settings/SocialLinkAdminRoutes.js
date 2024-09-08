import express from 'express';
const router = express.Router();
import { getSocialLinksController, updateSocialLinksController } from '../../../controllers/Admin/GeneralSettings/SocialLinksController.js';

router.get('/social-links', getSocialLinksController);
router.put('/social-links', updateSocialLinksController);

export default router;