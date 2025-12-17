import Report from "../models/reportModel.js";
import mongoose from "mongoose";
import Reporter from "../models/reporterModel.js";
import NGO from "../models/ngoModel.js";

// 1. Create a Report
export const createReport = async (req, res, next) => {
  try {
    const { type, description, severity, latitude, longitude } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => file.path); // Cloudinary stores the URL in 'path'
    }

    const report = await Report.create({
      type,
      description,
      severity,
      images: imageUrls,
      reporter_id: req.user.id, // Comes from authMiddleware
      location: { type: "Point", coordinates: [longitude, latitude] },
    });

    await Reporter.findByIdAndUpdate(req.user.id, {
      $inc: { reports_posted: 1 },
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("new_report", {
        message: "New Help Request Nearby!",
        report: report,
      });
      console.log("📡 Event Emitted: new_report"); // Log for debugging
    }

    res.status(201).json({ status: "success", data: report });
  } catch (err) {
    next(err);
  }
};

// 2. Get Reports Near Me (For NGOs)
export const getNearbyReports = async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query; // Radius in meters

    // Validation: Ensure lat/lng exist
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ status: "error", message: "Please provide lat and lng" });
    }

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius) || 10000, // Default 10km
        },
      },
      status: "Open", // Only show open cases
    }).populate("reporter_id", "name phone"); // Optional: Show reporter details

    res
      .status(200)
      .json({ status: "success", count: reports.length, data: reports });
  } catch (err) {
    next(err);
  }
};

// 3. Claim a Report (NGO Only)
export const claimReport = async (req, res, next) => {
  try {
    if (
      req.user.role === "ngo" &&
      req.user.verification_status !== "verified"
    ) {
      return res.status(403).json({
        status: "fail",
        message:
          "Your account is pending verification. You cannot perform this action yet.",
      });
    }

    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.status !== "Open") {
      return res
        .status(400)
        .json({ message: "Report is already claimed or resolved" });
    }

    report.status = "Claimed";
    report.claimed_by = req.user.id;
    await report.save();

    await NGO.findByIdAndUpdate(req.user.id, {
      $inc: { cases_claimed: 1 },
    });

    res.status(200).json({ status: "success", data: report });
  } catch (err) {
    next(err);
  }
};

// 4. Resolve a Report (NGO Uploads Proof -> Reporter gets Karma)
export const resolveReport = async (req, res, next) => {
  try {
    if (
      req.user.role === "ngo" &&
      req.user.verification_status !== "verified"
    ) {
      return res.status(403).json({
        status: "fail",
        message:
          "Your account is pending verification. You cannot perform this action yet.",
      });
    }

    const { id } = req.params;

    // 1. Check if Report exists and is claimed by this NGO
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (!report.claimed_by.equals(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You can only resolve cases you claimed." });
    }

    // 2. Handle Proof Images
    let proofUrls = [];
    if (req.files && req.files.length > 0) {
      proofUrls = req.files.map((file) => file.path);
    } else {
      return res
        .status(400)
        .json({ message: "Proof images are required to resolve a case." });
    }

    // 3. Update Report Status
    report.status = "Resolved";
    report.resolution_images = proofUrls;
    await report.save();

    // 4. Give Karma to Reporter!
    await mongoose.model("Reporter").findByIdAndUpdate(report.reporter_id, {
      $inc: {
        karma_points: 20,
        reports_resolved: 1,
      },
    });

    // 5. Give Impact Score to NGO! 🏆
    await mongoose.model("NGO").findByIdAndUpdate(req.user.id, {
      $inc: { impact_score: 50, cases_resolved: 1 },
    });

    // Emit update
    const io = req.app.get("io");
    if (io) {
      io.emit("report_resolved", {
        reportId: report._id,
        message: "Case Resolved! 🎉",
      });
    }

    res.status(200).json({ status: "success", data: report });
  } catch (err) {
    next(err);
  }
};

// 5. Get Cases Claimed by the Logged-in NGO
export const getMyCases = async (req, res, next) => {
  try {
    const reports = await Report.find({
      claimed_by: req.user.id,
      status: { $ne: "Resolved" }, // Show 'Claimed' but not 'Resolved' (History shows resolved)
    }).populate("reporter_id", "name phone");

    res
      .status(200)
      .json({ status: "success", count: reports.length, data: reports });
  } catch (err) {
    next(err);
  }
};
