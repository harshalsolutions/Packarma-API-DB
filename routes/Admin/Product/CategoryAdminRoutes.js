import express from 'express';
import upload from '../../../middlewares/multerMiddleware.js';
import { createCategoryController, deleteCategoryController, getAllCategoriesController, getCategoryController, updateCategoryController } from '../../../controllers/Admin/Product/CategoryController.js';

const router = express.Router();

router.get("/categories", getAllCategoriesController);
router.get("/categories/:id", getCategoryController);
router.post("/categories", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'unselected', maxCount: 1 }]), createCategoryController);
router.put("/categories/:id", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'unselected', maxCount: 1 }]), updateCategoryController);
router.delete("/categories/:id", deleteCategoryController);

export default router;
