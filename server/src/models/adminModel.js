import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "super_admin" },
    fcm_token: { type: String },
    // Security logs: track when admin did something sensitive
    action_logs: [
      {
        action: String,
        target_id: String,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
