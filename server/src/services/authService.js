import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Reporter from "../models/reporterModel.js";
import NGO from "../models/ngoModel.js";
import Admin from "../models/adminModel.js";

// Helper to generate Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secret123", {
    expiresIn: "30d",
  });
};

// 1. Reporter Registration
export const registerReporter = async (data) => {
  const { name, phone, password } = data;
  const existing = await Reporter.findOne({ phone });
  if (existing) throw new Error("Phone number already registered");

  const hashedPassword = await bcrypt.hash(password, 10);
  const reporter = await Reporter.create({
    name,
    phone,
    password: hashedPassword,
  });

  return {
    user: { id: reporter._id, name: reporter.name, role: "reporter" },
    token: generateToken(reporter._id, "reporter"),
  };
};

// 2. NGO Registration
export const registerNGO = async (data) => {
  const {
    name,
    email,
    phone,
    password,
    registration_number,
    latitude,
    longitude,
  } = data;

  const existing = await NGO.findOne({
    $or: [{ email }, { registration_number }],
  });
  if (existing)
    throw new Error("NGO already exists with this email or license");

  const hashedPassword = await bcrypt.hash(password, 10);

  const ngo = await NGO.create({
    name,
    email,
    phone,
    password: hashedPassword,
    registration_number,
    owner_name: name,
    location: { type: "Point", coordinates: [longitude, latitude] },
  });

  return {
    user: { id: ngo._id, name: ngo.name, role: "ngo" },
    token: generateToken(ngo._id, "ngo"),
  };
};

// 3. Admin: Force Create Trusted NGO (Bypasses Verification)
export const createTrustedNGO = async (data, adminId) => {
  const { name, email, phone, password, latitude, longitude } = data;

  const existing = await NGO.findOne({ email: data.email });
  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);

  const ngo = await NGO.create({
    name,
    email,
    phone,
    password: hashedPassword,
    registration_number:
      data.registration_number || `ADMIN_VERIFIED_${Date.now()}`,
    owner_name: "Admin Added",
    location: { type: "Point", coordinates: [longitude, latitude] },
    verification_status: "verified",
  });

  // Log this action (Optional but good for security)
  await Admin.findByIdAndUpdate(adminId, {
    $push: {
      action_logs: {
        action: "Created Trusted NGO",
        target_id: ngo._id,
        timestamp: new Date(),
      },
    },
  });

  return ngo;
};

export const loginUser = async (identifier, password) => {
  // 1. Try finding a Reporter (by Phone)
  let user = await Reporter.findOne({ phone: identifier });
  let role = "reporter";

  // 2. If not found, try finding an NGO (by Email)
  if (!user) {
    user = await NGO.findOne({ email: identifier });
    role = "ngo";
  }

  // 3. If still not found, try finding an Admin (by Username)
  if (!user) {
    user = await Admin.findOne({ username: identifier });
    role = "admin";
  }

  // 4. If absolutely no one found
  if (!user) throw new Error("User not found");

  // 5. Verify Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // 6. Return Data (Frontend needs the role to redirect!)
  return {
    user: {
      id: user._id,
      name: user.name || user.username,
      role: role, // Backend determines role now
    },
    token: generateToken(user._id, role),
  };
};
