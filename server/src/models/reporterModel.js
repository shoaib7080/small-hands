import mongoose from "mongoose";

const reporterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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
  },
  { timestamps: true }
);

const Reporter = mongoose.model("Reporter", reporterSchema);
export default Reporter;
