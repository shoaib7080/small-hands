// models/pendingRegistrationModel.js
import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, required: true },
    emailVerificationToken: { type: String, required: true },
    emailVerificationExpires: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("PendingRegistration", pendingRegistrationSchema);
