import express from "express";
import * as authController from "../controllers/authController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  reporterRegisterSchema,
  ngoRegisterSchema,
  loginSchema,
} from "../utils/authValidation.js";
import { getMe } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

/**
 * @swagger
 * /api/auth/register/reporter:
 * post:
 * summary: Register a new Reporter
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * phone:
 * type: string
 * password:
 * type: string
 * responses:
 * 201:
 * description: Created successfully
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

export default router;
