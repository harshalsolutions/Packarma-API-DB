import express from 'express';
import { getAllProductsController, getProductByIdController, createProductController, updateProductController, deleteProductController } from '../../../controllers/Admin/Product/ProductController.js';
import upload from '../../../middlewares/multerMiddleware.js';
const router = express.Router();

router.get("/get-products", getAllProductsController);
router.get("/get-product/:id", getProductByIdController);
router.post("/add-product", upload.single('product_image'), createProductController);
router.put("/update-product/:id", upload.single('product_image'), updateProductController);
router.delete("/delete-product/:id", deleteProductController);

export default router; 
