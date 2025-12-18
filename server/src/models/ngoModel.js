import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isEmailVerified: { type: Boolean, default: false },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: "ngo", immutable: true },

    // Verification Data
    registration_number: { type: String, required: true, unique: true }, // Govt ID
    owner_name: { type: String, required: true },
    verification_status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verification_docs: [{ type: String }], // Array of Cloudinary URLs (PDFs/Images)

    // Geo-Spatial Data
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true }, // [Longitude, Latitude]
    },
    service_radius_km: { type: Number, default: 10 }, // How far they operate

    // Public Profile
    website: String,
    donation_link: String,
    cases_claimed: { type: Number, default: 0 },
    cases_resolved: { type: Number, default: 0 },
    impact_score: { type: Number, default: 0 }, // For Leaderboard
    emailVerificationToken: String,
    emailVerificationExpires: Date,
  },
  { timestamps: true }
);

ngoSchema.add({
  passwordResetToken: String,
  passwordResetExpires: Date,
});

ngoSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash it before saving to DB (Security)
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins

  return resetToken; // Send unhashed version to user
};

// Indexing: This makes "Find NGOs near me" lightning fast
ngoSchema.index({ location: "2dsphere" });

const NGO = mongoose.model("NGO", ngoSchema);
export default NGO;
