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

export const updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;

    const userId = req.user.id;
    const role = req.user.role;

    let Model;
    if (role === "reporter") Model = Reporter;
    else if (role === "ngo") Model = NGO;
    else return res.status(400).json({ message: "Invalid role" });

    await Model.findByIdAndUpdate(userId, { fcmToken });

    res.status(200).json({ status: "success", message: "Token updated" });
  } catch (err) {
    next(err);
  }
};
