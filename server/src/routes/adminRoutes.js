import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

// 🔒 GLOBAL LOCK: All routes below require login + admin role
router.use(protect);
router.use(restrictTo("admin", "super_admin"));

// Dashboard Stats
router.get("/stats", adminController.getDashboardStats);

// NGO Management
router.get("/ngos", adminController.getNGOs); // ?status=pending
router.post("/ngos", adminController.addTrustedNGO);
router.patch("/ngos/:id/verify", adminController.verifyNGO);
router.delete("/ngos/:id", adminController.deleteNGO);

// Reporter Management
router.get("/reporters", adminController.getReporters);
router.delete("/reporters/:id", adminController.deleteReporter);
router.patch("/reporters/:id/ban", adminController.banReporter);

// Report Moderation
router.get("/reports", adminController.getAllReports);
router.delete("/reports/:id", adminController.deleteReport);
router.patch("/reports/:id/unflag", adminController.unflagReport);

export default router;
