import express from 'express';
import upload from '../../../middlewares/multerMiddleware.js';
import { createProductFormController, deleteProductFormController, getAllProductFormsController, getProductFormController, updateProductFormController } from "../../../controllers/Admin/Product/ProductFormController.js"
const router = express.Router();

router.get("/product-form", getAllProductFormsController);
router.get("/product-form/:id", getProductFormController);
router.post("/product-form", upload.single('image'), createProductFormController);
router.put("/product-form/:id", upload.single('image'), updateProductFormController);
router.delete("/product-form/:id", deleteProductFormController);

export default router;
