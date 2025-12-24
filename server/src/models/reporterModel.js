import mongoose from "mongoose";
import crypto from "crypto";

const reporterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true },
    password: {
      type: String,
      required: function () {
        // Only required if NOT using Google Auth
        return !this.googleId;
      },
    },

    googleId: { type: String },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },

    email: { type: String, unique: true, sparse: true },
    avatar: { type: String, default: "default.jpg" },
    isEmailVerified: { type: Boolean, default: false },
    role: { type: String, default: "reporter", immutable: true },

    // Gamification
    karma_points: { type: Number, default: 0 },
    badges: [{ type: String }],
    reports_posted: { type: Number, default: 0 },
    reports_resolved: { type: Number, default: 0 },

    default_location: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },
    fcmToken: { type: String },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
  },
  { timestamps: true }
);

reporterSchema.add({
  passwordResetToken: String,
  passwordResetExpires: Date,
});

reporterSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash it before saving to DB (Security)
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins

  return resetToken; // Send unhashed version to user
};

const Reporter = mongoose.model("Reporter", reporterSchema);
export default Reporter;
