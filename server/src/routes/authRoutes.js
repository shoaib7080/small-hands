import express from "express";
import * as authController from "../controllers/authController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  reporterRegisterSchema,
  ngoRegisterSchema,
  loginSchema,
  updateProfileSchema,
} from "../utils/authValidation.js";
import { getMe } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

/**
 * @swagger
 * /api/auth/register/reporter:
 *   post:
 *     summary: Register a new Reporter
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created successfully
 */

const router = express.Router();

router.post(
  "/register/reporter",
  validate(reporterRegisterSchema),
  authController.register
);
router.post(
  "/register/ngo",
  validate(ngoRegisterSchema),
  authController.register
);
router.get("/me", protect, getMe);

router.post("/login", validate(loginSchema), authController.login);

router.put(
  "/profile",
  protect,
  validate(updateProfileSchema),
  authController.updateProfile
);

router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-reset-otp", authController.verifyResetOTP);
router.post("/reset-password", authController.resetPassword);

router.post(
  "/send-verification",
  protect,
  authController.sendVerificationEmail
);
router.post("/verify-email", protect, authController.verifyEmail);

export default router;
