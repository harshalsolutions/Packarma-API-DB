import { Router } from 'express';
import { addSearchHistoryController, getCategoryByPackagingTreatmentController, getCategoryController, getPackagingTreatmentsController, getPackingTypesController, getProductsController, getProductWeightOptionsController, getSearchHistoryController, getShelfLifeOptionsController, searchPackagingSolutionsController, searchProductSuggestionsController } from '../../controllers/App/ProductController.js';
import authMiddleware from "../../middlewares/authMiddleware.js"

const router = Router();

router.get('/category', getCategoryController);
router.get('/packaging-treatments', getPackagingTreatmentsController);

router.get('/get-products', getProductsController);
router.get('/product-suggestions', searchProductSuggestionsController);
router.get('/packing-types', getPackingTypesController);
router.get('/shelf-life-options', getShelfLifeOptionsController);
router.get('/product-weight-options', getProductWeightOptionsController);


router.post('/search-solution', searchPackagingSolutionsController);

router.get('/category-by-treatment/:id', getCategoryByPackagingTreatmentController);

router.get('/search-history', authMiddleware, getSearchHistoryController);
router.post('/search-history', authMiddleware, addSearchHistoryController);

export default router;
