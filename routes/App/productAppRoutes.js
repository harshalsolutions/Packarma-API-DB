import { Router } from "express";
import {
  getCategoryController,
  getPackagingTreatmentsController,
  getPackingTypesController,
  getProductsController,
  getProductWeightOptionsController,
  getSearchHistoryController,
  getShelfLifeOptionsController,
  getSubCategoryByPackagingTreatmentController,
  searchProductSuggestionsController,
} from "../../controllers/App/ProductController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { searchPackagingSolutionsController } from "../../controllers/App/SearchSolutionController.js";

const router = Router();

router.get("/category", authMiddleware, getCategoryController);
router.get(
  "/packaging-treatments",
  authMiddleware,
  getPackagingTreatmentsController
);

router.get("/get-products", authMiddleware, getProductsController);
router.get(
  "/product-suggestions",
  authMiddleware,
  searchProductSuggestionsController
);
router.get("/packing-types", authMiddleware, getPackingTypesController);
router.get(
  "/shelf-life-options",
  authMiddleware,
  getShelfLifeOptionsController
);
router.get(
  "/product-weight-options",
  authMiddleware,
  getProductWeightOptionsController
);

router.post(
  "/search-solution",
  authMiddleware,
  searchPackagingSolutionsController
);

router.get(
  "/subcategory-by-treatment/:id",
  authMiddleware,
  getSubCategoryByPackagingTreatmentController
);

router.get("/search-history", authMiddleware, getSearchHistoryController);

export default router;
