import { Router } from 'express';
import { getCategoryController, getPackagingTreatmentsController } from '../../controllers/App/ProductController.js';
const router = Router();

router.get('/category', getCategoryController);
router.get('/packaging-treatments', getPackagingTreatmentsController);

export default router;
