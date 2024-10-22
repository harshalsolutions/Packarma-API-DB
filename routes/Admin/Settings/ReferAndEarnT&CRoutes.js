import express from 'express';
const router = express.Router();
import { getReferAndEarnTAndCController, updateReferAndEarnTAndCController } from '../../../controllers/Admin/GeneralSettings/ReferAndEarnT&C.js';

router.get('/refer-earn/terms-and-conditions', getReferAndEarnTAndCController);
router.put('/refer-earn/terms-and-conditions', updateReferAndEarnTAndCController);

export default router;