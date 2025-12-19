import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secret123", {
    expiresIn: "30d",
  });
};

export const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);

  // Remove password from output
  const { password, ...userWithoutPassword } = user.toObject();

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: userWithoutPassword,
    },
  });
};
