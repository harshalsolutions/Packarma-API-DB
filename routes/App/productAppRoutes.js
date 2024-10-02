import { Router } from 'express';
import { getCategoryController, getPackagingTreatmentsController, getPackingTypesController, getProductsController, getProductWeightOptionsController, getSearchHistoryController, getShelfLifeOptionsController, getSubCategoryByPackagingTreatmentController, searchPackagingSolutionsController, searchProductSuggestionsController } from '../../controllers/App/ProductController.js';
import authMiddleware from "../../middlewares/authMiddleware.js"

const router = Router();

router.get('/category', getCategoryController);
router.get('/packaging-treatments', getPackagingTreatmentsController);

router.get('/get-products', getProductsController);
router.get('/product-suggestions', searchProductSuggestionsController);
router.get('/packing-types', getPackingTypesController);
router.get('/shelf-life-options', getShelfLifeOptionsController);
router.get('/product-weight-options', getProductWeightOptionsController);

router.post('/search-solution', authMiddleware, searchPackagingSolutionsController);

router.get('/subcategory-by-treatment/:id', getSubCategoryByPackagingTreatmentController);

router.get('/search-history', authMiddleware, getSearchHistoryController);

export default router;
