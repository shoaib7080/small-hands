import * as authService from "../services/authService.js";
import NGO from "../models/ngoModel.js";
import Reporter from "../models/reporterModel.js";
import Report from "../models/reportModel.js";
import admin from "../utils/firebaseAdmin.js";

export const addTrustedNGO = async (req, res, next) => {
  //Route to be created
  try {
    // req.user.id comes from the auth middleware (we will add this next)
    const result = await authService.createTrustedNGO(req.body, req.user.id);
    res.status(201).json({
      status: "success",
      message: "Trusted NGO created!",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// 1. Dashboard Stats (The "Big Picture")
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalNGOs = await NGO.countDocuments();
    const pendingNGOs = await NGO.countDocuments({
      verification_status: "pending",
    });
    const verifiedNGOs = await NGO.countDocuments({
      verification_status: "verified",
    });

    const totalReporters = await Reporter.countDocuments();

    const totalReports = await Report.countDocuments();
    const resolvedReports = await Report.countDocuments({ status: "Resolved" });
    const openReports = await Report.countDocuments({ status: "Open" });

    res.status(200).json({
      status: "success",
      data: {
        ngos: {
          total: totalNGOs,
          pending: pendingNGOs,
          verified: verifiedNGOs,
        },
        reporters: { total: totalReporters },
        reports: {
          total: totalReports,
          resolved: resolvedReports,
          open: openReports,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// 2. Get NGOs (Filter by Status)
export const getNGOs = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) query.verification_status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const ngos = await NGO.find(query).select("-password");
    res
      .status(200)
      .json({ status: "success", results: ngos.length, data: ngos });
  } catch (err) {
    next(err);
  }
};

// 3. Verify an NGO
export const verifyNGO = async (req, res, next) => {
  try {
    const ngoId = req.params.id;

    const ngo = await NGO.findByIdAndUpdate(
      ngoId,
      { verification_status: "verified" },
      { new: true }
    );

    if (!ngo) return res.status(404).json({ message: "NGO not found" });

    const io = req.app.get("io");

    console.log("Emitting ngo:verification-approved to user_" + ngoId);

    // Notify the specific NGO
    io.to(`user_${ngoId}`).emit("ngo:verification-approved", {
      message:
        "Your NGO has been verified! You can now access the Live Console.",
      timestamp: new Date(),
    });

    // FCM notification
    if (ngo.fcm_token) {
      try {
        const admin = (await import("../utils/firebaseAdmin.js")).default;
        const message = {
          notification: {
            title: "NGO Verified",
            body: "Your organization has been approved! You can now claim cases.",
          },
          data: {
            type: "ngo_verified",
          },
          token: ngo.fcm_token,
        };
        await admin.messaging().send(message);
        console.log("FCM notification sent to NGO");
      } catch (notifErr) {
        console.error("FCM notification failed:", notifErr);
      }
    }

    res.status(200).json({
      status: "success",
      message: "NGO Approved",
      data: ngo,
    });
  } catch (err) {
    next(err);
  }
};

// 4. Reject/Delete NGO
export const deleteNGO = async (req, res, next) => {
  try {
    await NGO.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};

// 5. Get All Reporters
export const getReporters = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const reporters = await Reporter.find().select("-password");
    res
      .status(200)
      .json({ status: "success", results: reporters.length, data: reporters });
  } catch (err) {
    next(err);
  }
};

// 6. Ban/Delete Reporter
export const deleteReporter = async (req, res, next) => {
  try {
    await Reporter.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};

// 7. Get All Reports (For Moderation)
export const getAllReports = async (req, res, next) => {
  try {
    const { reporterId, ngoId, status, type, severity } = req.query;

    let filter = {};
    if (reporterId) filter.reporter_id = reporterId;
    if (ngoId) filter.claimed_by = ngoId;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    const reports = await Report.find(filter)
      .populate("reporter_id", "name phone")
      .populate("claimed_by", "name")
      .sort({ createdAt: -1 }); // Newest first

    res
      .status(200)
      .json({ status: "success", results: reports.length, data: reports });
  } catch (err) {
    next(err);
  }
};

// 8. Delete Offensive Report
export const deleteReport = async (req, res, next) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};

export const banReporter = async (req, res, next) => {
  try {
    const reporter = await Reporter.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true }
    );

    if (!reporter) {
      return res.status(404).json({ message: "Reporter not found" });
    }

    res.status(200).json({
      status: "success",
      message: "User banned successfully",
      data: reporter,
    });
  } catch (err) {
    next(err);
  }
};
