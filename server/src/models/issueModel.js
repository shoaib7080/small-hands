import mongoose from "mongoose";

// Issue Model (inline for simplicity)
const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Bug", "Feature Request", "Performance", "UI/UX", "Other"],
      default: "Bug",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    reported_by: {
      user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
      user_role: {
        type: String,
        enum: ["reporter", "ngo", "admin"],
        required: true,
      },
      user_name: String,
    },
    device_info: {
      platform: String,
      browser: String,
      version: String,
    },
  },
  { timestamps: true }
);

const Issue = mongoose.models.Issue || mongoose.model("Issue", issueSchema);
export default Issue;
