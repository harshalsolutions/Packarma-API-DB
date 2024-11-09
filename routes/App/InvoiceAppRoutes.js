import express from "express";
import {
  generateInvoiceController,
  getInvoiceByIdController,
  getInvoicesController,
} from "../../controllers/App/InvoiceController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/get-invoices", authMiddleware, getInvoicesController);
router.get("/get-invoice/:id", authMiddleware, getInvoiceByIdController);

router.post(
  "/create-invoice/:invoice_type",
  authMiddleware,
  generateInvoiceController
);

export default router;
