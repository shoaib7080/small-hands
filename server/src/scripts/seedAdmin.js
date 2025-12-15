import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/adminModel.js";

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected");

    // 1. Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "superadmin" });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt); // Default password

    // 3. Create Admin
    await Admin.create({
      username: "superadmin",
      password: hashedPassword,
      role: "super_admin",
      action_logs: [{ action: "System Initialized", timestamp: new Date() }],
    });

    console.log("Super Admin Created Successfully!");
    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createAdmin();
