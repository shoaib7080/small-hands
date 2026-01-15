// server/src/models/notificationModel.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType", // Dynamic reference based on userType
      index: true,
    },
    userType: {
      type: String,
      enum: ["Reporter", "NGO"],
      required: true,
    },
    type: {
      type: String,
      enum: [
        "account_accepted",
        "account_rejected",
        "new_case_nearby",
        "case_claimed",
        "case_resolved",
        "report_accepted",
        "report_rejected",
        "status_update",
        "message",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: {
      // Additional context: caseId, reportId, ngoId, etc.
      type: mongoose.Schema.Types.Mixed,
    },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    actionUrl: String, // Link to the relevant page
    icon: String, // Icon type for frontend
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Auto-cleanup old notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
