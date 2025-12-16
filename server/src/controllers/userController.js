import Reporter from "../models/reporterModel.js";
import NGO from "../models/ngoModel.js";

export const getMe = async (req, res, next) => {
  try {
    let user;
    if (req.user.role === "reporter") {
      user = await Reporter.findById(req.user.id).select("-password");
    } else if (req.user.role === "ngo") {
      user = await NGO.findById(req.user.id).select("-password");
    } else {
      // For admin, just return basic info or Admin model if you have one
      return res
        .status(200)
        .json({ status: "success", data: { name: "Admin", role: "admin" } });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
};
