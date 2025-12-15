import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // NGOs usually use email, Citizens use phone
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: "ngo", immutable: true },

    // The "Meat" - Verification Data
    registration_number: { type: String, required: true, unique: true }, // Govt ID
    owner_name: { type: String, required: true },
    verification_status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verification_docs: [{ type: String }], // Array of Cloudinary URLs (PDFs/Images)

    // Geo-Spatial Data (CRITICAL for your app)
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true }, // [Longitude, Latitude]
    },
    service_radius_km: { type: Number, default: 10 }, // How far they operate

    // Public Profile
    website: String,
    donation_link: String,
    impact_score: { type: Number, default: 0 }, // For Leaderboard
  },
  { timestamps: true }
);

// ⚡ Indexing: This makes "Find NGOs near me" lightning fast
ngoSchema.index({ location: "2dsphere" });

const NGO = mongoose.model("NGO", ngoSchema);
export default NGO;
