import express from "express";
import * as authController from "../controllers/authController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  reporterRegisterSchema,
  ngoRegisterSchema,
  loginSchema,
} from "../utils/authValidation.js";

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

router.post("/login", validate(loginSchema), authController.login);

export default router;
