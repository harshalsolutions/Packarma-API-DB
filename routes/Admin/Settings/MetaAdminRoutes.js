import express from 'express';
const router = express.Router();
import { getMetaDetailsController, updateMetaDetailsController } from '../../../controllers/Admin/GeneralSettings/MetaDetailsController.js';

router.get('/meta-details', getMetaDetailsController);
router.put('/meta-details', updateMetaDetailsController);

export default router;