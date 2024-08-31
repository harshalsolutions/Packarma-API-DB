import express from 'express';
import upload from '../../../middlewares/multerMiddleware.js';
import { createSubCategoryController, getAllSubCategoriesController, getSubCategoryController, updateSubCategoryController } from '../../../controllers/Admin/Product/SubCategoryController.js';
import { deleteCategoryController } from '../../../controllers/Admin/Product/CategoryController.js';

const router = express.Router();

router.get("/subcategories", getAllSubCategoriesController);
router.get("/subcategories/:id", getSubCategoryController);
router.post("/subcategories", upload.single('image'), createSubCategoryController);
router.put("/subcategories/:id", upload.single('image'), updateSubCategoryController);
router.delete("/subcategories/:id", deleteCategoryController);

export default router;
