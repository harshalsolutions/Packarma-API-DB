import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { getAllBannerController } from "../../controllers/Admin/Master/bannerController.js";
import { logBannerActivityController } from "../../controllers/App/BannerActivity.js";
const router = express.Router();

router.get("/get-banners", authMiddleware, getAllBannerController);
router.patch("/log-activity", authMiddleware, logBannerActivityController); //add views and click

export default router;
