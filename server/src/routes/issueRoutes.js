import e from "express";
import * as issueController from "../controllers/issueController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = e.Router();

// Any authenticated user can register an issue
router.post("/", protect, issueController.registerIssue);

// Only admins can view and manage issues
router.get(
  "/",
  protect,
  restrictTo("admin", "super_admin"),
  issueController.getIssues
);

router.patch(
  "/:id/status",
  protect,
  restrictTo("admin", "super_admin"),
  issueController.updateIssueStatus
);

export default router;
