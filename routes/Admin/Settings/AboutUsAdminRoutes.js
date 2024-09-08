import express from 'express';
const router = express.Router();
import { getAboutUsController, updateAboutUsController } from '../../../controllers/Admin/GeneralSettings/AboutUsController.js';

router.get('/about-us', getAboutUsController);
router.put('/about-us', updateAboutUsController);

export default router;