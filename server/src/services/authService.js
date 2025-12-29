import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Reporter from "../models/reporterModel.js";
import NGO from "../models/ngoModel.js";
import Admin from "../models/adminModel.js";
import PendingRegistration from "../models/pendingRegistrationModel.js";
import sendEmail from "../utils/email.js";

// Helper to generate Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secret123", {
    expiresIn: "30d",
  });
};

// Reporter Registration (OTP-based)
export const registerReporter = async (data) => {
  const { name, email, phone, password } = data;

  // Check if email exists in Reporter or NGO collections
  const existingReporter = await Reporter.findOne({ email });
  const existingNGO = await NGO.findOne({ email });

  if (existingReporter || existingNGO) {
    throw new Error("Email already registered");
  }

  // Check if phone exists (if provided)
  if (phone) {
    const existingPhone = await Reporter.findOne({ phone });
    if (existingPhone) {
      throw new Error("Phone number already registered");
    }
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update or create in PendingRegistration
  await PendingRegistration.findOneAndUpdate(
    { email },
    {
      name,
      email,
      phone,
      password: hashedPassword,
      role: "reporter",
      emailVerificationToken: hashedOTP,
      emailVerificationExpires: Date.now() + 10 * 60 * 1000,
    },
    { upsert: true, new: true }
  );

  // Send email
  const message = `Your verification code is: ${otp}\nValid for 10 minutes.`;
  await sendEmail({
    email,
    subject: "Small Hands: Verify your Email",
    message,
  });

  console.log(`✅ OTP sent to ${email}: ${otp}`);

  return { email };
};

// Verify Reporter Registration
export const verifyReporterRegistration = async (email, code) => {
  const hashedOTP = crypto.createHash("sha256").update(code).digest("hex");

  // Find in PendingRegistration collection
  const pendingUser = await PendingRegistration.findOne({
    email,
    emailVerificationToken: hashedOTP,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!pendingUser) {
    throw new Error("Invalid or expired verification code");
  }

  // Check for duplicate phone number before creating user
  if (pendingUser.phone) {
    const existingPhone = await Reporter.findOne({
      phone: pendingUser.phone,
    });
    if (existingPhone) {
      throw new Error("Phone number already registered");
    }
  }

  // Create user in Reporter collection
  const newUser = await Reporter.create({
    name: pendingUser.name,
    email: pendingUser.email,
    phone: pendingUser.phone,
    password: pendingUser.password, // Already hashed
    isEmailVerified: true,
  });

  // Delete from PendingRegistration
  await PendingRegistration.findByIdAndDelete(pendingUser._id);

  // Return login data
  return {
    user: {
      id: newUser._id,
      name: newUser.name,
      role: "reporter",
      phone: newUser.phone,
      email: newUser.email,
    },
    token: generateToken(newUser._id, "reporter"),
  };
};

// NGO Registration
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
  let user = null;
  let role = null;

  // Check if identifier is email or phone
  const isEmail = identifier.includes("@");

  if (isEmail) {
    // Try finding by email in all collections
    user = await Reporter.findOne({ email: identifier });
    if (user) role = "reporter";

    if (!user) {
      user = await NGO.findOne({ email: identifier });
      if (user) role = "ngo";
    }

    if (!user) {
      user = await Admin.findOne({ email: identifier });
      if (user) role = "admin";
    }
  } else {
    // Try finding by phone in all collections
    user = await Reporter.findOne({ phone: identifier });
    if (user) role = "reporter";

    if (!user) {
      user = await NGO.findOne({ phone: identifier });
      if (user) role = "ngo";
    }

    // Admin login by username (fallback)
    if (!user) {
      user = await Admin.findOne({ username: identifier });
      if (user) role = "admin";
    }
  }

  // If absolutely no one found
  if (!user) throw new Error("User not found");

  // 5. Verify Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // 6. Return Data (Frontend needs the role to redirect!)
  return {
    user: {
      id: user._id,
      name: user.name || user.username,
      role: role,
      phone: user.phone,
      email: user.email,
    },
    token: generateToken(user._id, role),
  };
};

export const updateUserProfile = async (userId, updateData) => {
  const {
    name,
    email,
    phone,
    latitude,
    longitude,
    documents,
    website,
    donation_link,
    service_radius_km,
  } = updateData;

  // Find user in all collections
  let user = await Reporter.findById(userId);
  let role = "reporter";

  if (!user) {
    user = await NGO.findById(userId);
    if (user) role = "ngo";
  }
  if (!user) {
    user = await Admin.findById(userId);
    if (user) role = "admin";
  }

  if (!user) {
    throw new Error("User not found");
  }

  // Update Standard Fields
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (email && email !== user.email) {
    user.email = email;
    user.isEmailVerified = false; // Reset verification status
  }

  // NGO Specific Updates
  if (role === "ngo") {
    if (latitude && longitude) {
      user.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    if (website !== undefined) user.website = website;
    if (donation_link !== undefined) user.donation_link = donation_link;
    if (service_radius_km !== undefined)
      user.service_radius_km = parseFloat(service_radius_km);

    if (documents && documents.length > 0) {
      // Initialize array if undefined
      if (!user.verification_docs) user.verification_docs = [];
      user.verification_docs.push(...documents);

      // Optional: Reset verification status if they are updating docs
      if (user.verification_status === "rejected") {
        user.verification_status = "pending";
      }
    }
  }

  await user.save();

  // Return user without password
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};
