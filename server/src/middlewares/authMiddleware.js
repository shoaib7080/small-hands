import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (Bearer <token>)
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

      // Add user info to request object
      req.user = { id: decoded.id, role: decoded.role };

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
      return res
        .status(403)
        .json({
          status: "error",
          message: "You do not have permission to perform this action",
        });
    }
    next();
  };
};
