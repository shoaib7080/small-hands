import express from "express";
import * as userController from "../controllers/userController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.patch("/update-fcm-token", protect, userController.updateFcmToken);
router.get("/me", protect, userController.getMe);

export default router;
