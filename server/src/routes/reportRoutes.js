import express from "express";
import * as reportController from "../controllers/reportController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Only Reporters can create
router.post(
  "/",
  protect,
  restrictTo("reporter"),
  upload.array("images", 3),
  reportController.createReport
);

// Only NGOs can see nearby reports (or Admins)
router.get(
  "/nearby",
  protect,
  restrictTo("ngo", "admin"),
  reportController.getNearbyReports
);

router.get(
  "/my-cases",
  protect,
  restrictTo("ngo"),
  reportController.getMyCases
);

// Only NGOs can claim
router.patch(
  "/:id/claim",
  protect,
  restrictTo("ngo"),
  reportController.claimReport
);

//Resolve with Proof (Images)
router.patch(
  "/:id/resolve",
  protect,
  restrictTo("ngo"),
  upload.array("proof", 3), // Allow max 3 proof images
  reportController.resolveReport
);

router.get("/my-reports", protect, reportController.getMyReports);

router.get(
  "/recent-resolved",
  protect,
  reportController.getRecentResolvedCases
);
router.patch(
  "/:id/flag",
  protect,
  restrictTo("ngo"),
  reportController.flagReport
);

// recent-active
// router.get("/recent-active", protect, reportController.getRecentActiveCases);

// Public NGO profile
router.get("/ngo/:id", reportController.getNGOProfile);

export default router;
