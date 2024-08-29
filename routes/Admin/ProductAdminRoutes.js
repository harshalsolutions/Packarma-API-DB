import express from 'express';
import upload from '../../middlewares/multerMiddleware.js';
import { createCategoryController, deleteCategoryController, getAllCategoriesController, getCategoryController, updateCategoryController } from '../../controllers/Admin/Product/CategoryController.js';

const router = express.Router();

router.get("/categories", getAllCategoriesController);
router.get("/categories/:id", getCategoryController);
router.post("/categories", upload.single('image'), createCategoryController);
router.put("/categories/:id", upload.single('image'), updateCategoryController);
router.delete("/categories/:id", deleteCategoryController);

export default router;
