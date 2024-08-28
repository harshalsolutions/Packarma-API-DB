import { Router } from 'express';
import { getGeneralSettingsController } from "../../controllers/App/AppDataController.js"

const router = Router();


router.get('/get-data', getGeneralSettingsController);




export default router;
