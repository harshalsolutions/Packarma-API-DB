import { Router } from 'express';
import { getCategoryController, getPackagingTreatmentsController, getPackingTypesController, getProductsController, getProductWeightOptionsController, getShelfLifeOptionsController, searchPackagingSolutionsController, searchProductSuggestionsController } from '../../controllers/App/ProductController.js';
const router = Router();

router.get('/category', getCategoryController);
router.get('/packaging-treatments', getPackagingTreatmentsController);

router.get('/get-products', getProductsController);
router.get('/product-suggestions', searchProductSuggestionsController);
router.get('/packing-types', getPackingTypesController);
router.get('/shelf-life-options', getShelfLifeOptionsController);
router.get('/product-weight-options', getProductWeightOptionsController);


router.post('/search-solution', searchPackagingSolutionsController);

export default router;
