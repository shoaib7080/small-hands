import * as authService from "../services/authService.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/email.js";
import Reporter from "../models/reporterModel.js";
import NGO from "../models/ngoModel.js";
import { OAuth2Client } from "google-auth-library";
import { createSendToken } from "../utils/jwtToken.js";
import logger from "../utils/logger.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body; // Token from Frontend

    // 1. Verify Token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // 2. Extract Info
    const { name, email, picture, sub, email_verified } = ticket.getPayload();

    // 3. Check if user already exists
    let user = await Reporter.findOne({ email });

    logger.info(`User ${email} logged in successfully`);

    if (user) {
      // CASE A: User exists
      // Optional: Update their avatar if they changed it on Google
      if (!user.googleId) {
        // Link Google to existing email account
        user.googleId = sub;
        user.authProvider = "google";
        user.isEmailVerified = true; // Trust Google
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // CASE B: New User (Register them)
      user = await Reporter.create({
        name: name,
        email: email,
        avatar: picture, // Save Google Photo
        googleId: sub,
        authProvider: "google",
        isEmailVerified: email_verified, // Usually true
        password: undefined, // Explicitly no password
      });
    }

    // 4. Log them in (Send JWT)
    createSendToken(user, 200, res);
  } catch (err) {
    logger.error("Login Failed", {
      meta: { error: error.message, stack: error.stack },
    });
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const { role, email } = req.body;

    if (role === "reporter") {
      // Create user but mark email as unverified
      const user = await authService.registerReporter({
        ...req.body,
        isEmailVerified: false,
      });

      // Send verification email immediately
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

      user.emailVerificationToken = hashedOTP;
      user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      const message = `Your verification code is: ${otp}\nValid for 10 minutes.`;
      await sendEmail({
        email: email,
        subject: "Small Hands: Verify your Email",
        message,
      });

      res.status(201).json({
        status: "success",
        message:
          "Registration successful! Please check your email for verification code.",
        data: { email: user.email },
      });
    } else if (role === "ngo") {
      const result = await authService.registerNGO(req.body);
      res.status(201).json({ status: "success", data: result });
    } else {
      throw new Error("Invalid role");
    }
  } catch (err) {
    next(err);
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
    const { name, email, phone } = req.body;
    const userId = req.user.id;

    const updatedUser = await authService.updateUserProfile(userId, {
      name,
      email,
      phone,
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
    const { email } = req.body; // Get email from request body
    const user = await getModel(req.user.role).findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Generate random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash it before saving (Security best practice)
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    // Save to DB (Expires in 10 mins)
    user.emailVerificationToken = hashedOTP;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // Send Email to the NEW email address from request
    const message = `Your verification code is: ${otp}\nValid for 10 minutes.`;
    await sendEmail({
      email: email, // Use email from request body, not user.email
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
    const { code, email } = req.body;

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

    // Success! Mark verified, update email, and clear the token
    user.isEmailVerified = true;
    if (email) user.email = email;
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
