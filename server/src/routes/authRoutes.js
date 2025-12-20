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
 * /api/auth/login:
 *   post:
 *     summary: Log in a user (Reporter or NGO)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: User's email or phone
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/register/reporter:
 *   post:
 *     summary: Register a new Reporter with email verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [reporter]
 *     responses:
 *       201:
 *         description: Registration successful, verification email sent
 */

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Google OAuth authentication for reporters
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token
 *     responses:
 *       200:
 *         description: Google authentication successful
 */

/**
 * @swagger
 * /api/auth/verify-email-registration:
 *   post:
 *     summary: Verify email during registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
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
router.post("/google", authController.googleAuth);
router.post(
  "/verify-email-registration",
  authController.verifyEmailRegistration
);

export default router;
