import express from "express";
import * as reportController from "../controllers/reportController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only Reporters can create
router.post(
  "/",
  protect,
  restrictTo("reporter"),
  reportController.createReport
);

// Only NGOs can see nearby reports (or Admins)
router.get(
  "/nearby",
  protect,
  restrictTo("ngo", "admin"),
  reportController.getNearbyReports
);

// Only NGOs can claim
router.patch(
  "/:id/claim",
  protect,
  restrictTo("ngo"),
  reportController.claimReport
);

export default router;
