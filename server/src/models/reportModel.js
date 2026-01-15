import mongoose, { Schema } from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Food", "Medical", "Shelter", "Clothes", "Other"],
      required: true,
    },
    description: { type: String, required: true },
    contact_info: Schema.Types.Mixed, // Flexible to hold phone/email/other
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    // Images will be URLs from Cloudinary
    images: [{ type: String }],

    resolution_images: [{ type: String }],

    // Status Flow
    status: {
      type: String,
      enum: ["Open", "Claimed", "Resolved"],
      default: "Open",
    },

    // Who reported it?
    reporter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reporter",
      required: true,
    },

    // Who is helping?
    claimed_by: { type: mongoose.Schema.Types.ObjectId, ref: "NGO" },

    // Where is it?
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true }, // [Longitude, Latitude]
    },
    address: {
      locality: String,
      city: String,
      fullAddress: String,
    },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, default: "" },
    flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: "NGO" },
  },
  { timestamps: true }
);

// Index for map queries
reportSchema.index({ location: "2dsphere" });

const Report = mongoose.model("Report", reportSchema);
export default Report;
