import mongoose from "mongoose";
import Report from "../models/reportModel.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const updateReports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await Report.updateMany(
      { isFlagged: { $exists: false } },
      { $set: { isFlagged: false, flagReason: "" } }
    );

    console.log(`Updated ${result.modifiedCount} reports`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

updateReports();
