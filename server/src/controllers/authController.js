import * as authService from "../services/authService.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/email.js";
import Reporter from "../models/reporterModel.js";
import NGO from "../models/ngoModel.js";

export const register = async (req, res, next) => {
  try {
    const { role } = req.body;
    let result;

    if (role === "reporter") {
      result = await authService.registerReporter(req.body);
    } else if (role === "ngo") {
      result = await authService.registerNGO(req.body);
    } else {
      throw new Error("Invalid role");
    }

    res.status(201).json({ status: "success", data: result });
  } catch (err) {
    next(err); // Passes to global error handler
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const result = await authService.loginUser(identifier, password);
    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    const updatedUser = await authService.updateUserProfile(userId, {
      name,
      email,
    });
    res.status(200).json({ status: "success", data: updatedUser });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email in both Reporter and NGO collections
    let user = await Reporter.findOne({ email });
    if (!user) {
      user = await NGO.findOne({ email });
    }
    if (!user)
      return res.status(404).json({ message: "No user found with that email" });

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash it before saving
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    // Save to DB (Expires in 10 mins)
    user.passwordResetToken = hashedOTP;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // Send Email
    const message = `Your password reset code is: ${otp}\nValid for 10 minutes.`;
    await sendEmail({
      email: user.email,
      subject: "Small Hands: Password Reset Code",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Reset code sent to email!",
    });
  } catch (err) {
    next(err);
  }
};

// Add new function to verify OTP
export const verifyResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    // Find user with valid OTP
    let user = await Reporter.findOne({
      email,
      passwordResetToken: hashedOTP,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      user = await NGO.findOne({
        email,
        passwordResetToken: hashedOTP,
        passwordResetExpires: { $gt: Date.now() },
      });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    // Find user with valid OTP
    let user = await Reporter.findOne({
      email,
      passwordResetToken: hashedOTP,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      user = await NGO.findOne({
        email,
        passwordResetToken: hashedOTP,
        passwordResetExpires: { $gt: Date.now() },
      });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Helper to select the correct model based on login role
const getModel = (role) => (role === "ngo" ? NGO : Reporter);

export const sendVerificationEmail = async (req, res, next) => {
  try {
    const user = await getModel(req.user.role).findById(req.user.id);

    // Generate random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash it before saving (Security best practice)
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    // Save to DB (Expires in 10 mins)
    user.emailVerificationToken = hashedOTP;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // Send Email
    const message = `Your verification code is: ${otp}\nValid for 10 minutes.`;
    await sendEmail({
      email: user.email,
      subject: "Small Hands: Verify your Email",
      message,
    });

    res.status(200).json({ status: "success", message: "OTP sent to email!" });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Verification code is required" });
    }

    const hashedOTP = crypto.createHash("sha256").update(code).digest("hex");

    const user = await getModel(req.user.role).findOne({
      _id: req.user.id,
      emailVerificationToken: hashedOTP,
      emailVerificationExpires: { $gt: Date.now() }, // Must not be expired
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }

    // Success! Mark verified and clear the token
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Return updated user data (without password)
    const { password, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      status: "success",
      message: "Email Verified Successfully!",
      data: userWithoutPassword,
    });
  } catch (err) {
    next(err);
  }
};
