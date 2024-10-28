import express from "express";
import {
  exportAllSubscriptionController,
  getAllSubscriptionController,
  getAllUserSubscriptionsController,
  getFreeTrailSubscriptionDataController,
} from "../../../controllers/Admin/Customer/UserSubscriptionController.js";
const router = express.Router();

router.get("/subscriptions", getAllUserSubscriptionsController);
router.get("/subscription-list", getAllSubscriptionController);

router.get("/subscriptions-free-trail", getFreeTrailSubscriptionDataController);

router.post("/subscriptions/export", exportAllSubscriptionController);

export default router;
