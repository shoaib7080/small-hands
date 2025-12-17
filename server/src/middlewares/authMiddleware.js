import jwt from "jsonwebtoken";
import NGO from "../models/ngoModel.js";
import Reporter from "../models/reporterModel.js";
import Admin from "../models/adminModel.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

      // Fetch full user data based on role
      let user;
      if (decoded.role === "ngo") {
        user = await NGO.findById(decoded.id);
      } else if (decoded.role === "reporter") {
        user = await Reporter.findById(decoded.id);
      } else if (decoded.role === "admin") {
        user = await Admin.findById(decoded.id);
      }

      if (!user) {
        return res
          .status(401)
          .json({ status: "error", message: "User not found" });
      }

      // Add full user info to request object
      req.user = {
        id: user._id,
        role: decoded.role,
        verification_status: user.verification_status || "verified", // Default for reporters/admins
        ...user.toObject(),
      };

      next();
    } catch (error) {
      res
        .status(401)
        .json({ status: "error", message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res
      .status(401)
      .json({ status: "error", message: "Not authorized, no token" });
  }
};

// Optional: Middleware to restrict to specific roles (e.g., only Admin)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
