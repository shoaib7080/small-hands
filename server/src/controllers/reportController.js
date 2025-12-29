import Report from "../models/reportModel.js";
import mongoose from "mongoose";
import Reporter from "../models/reporterModel.js";
import NGO from "../models/ngoModel.js";
import admin from "../utils/firebaseAdmin.js";

// Helper function to calculate distance between two points in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 1. Create a Report
export const createReport = async (req, res, next) => {
  try {
    const { type, description, contact_info, severity, latitude, longitude } =
      req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => file.path); // Cloudinary stores the URL in 'path'
    }

    const report = await Report.create({
      type,
      description,
      contact_info,
      severity,
      images: imageUrls,
      reporter_id: req.user.id, // Comes from authMiddleware
      location: { type: "Point", coordinates: [longitude, latitude] },
    });

    // --- NOTIFICATION LOGIC ---
    let nearbyNGOs = [];
    try {
      // Find all NGOs with tokens first
      const allNGOs = await NGO.find({
        fcmToken: { $exists: true, $ne: null },
      }).select("fcmToken location service_radius_km");

      // Filter NGOs based on their individual service radius
      nearbyNGOs = allNGOs.filter((ngo) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          ngo.location.coordinates[1],
          ngo.location.coordinates[0]
        );
        return distance <= (ngo.service_radius_km || 10); // Default to 10km if not set
      });

      console.log(`[DEBUG] New Report at [${longitude}, ${latitude}]`);
      console.log(`[DEBUG] Found ${nearbyNGOs.length} NGOs nearby`);

      if (nearbyNGOs.length > 0) {
        const tokens = nearbyNGOs.map((ngo) => ngo.fcmToken);
        console.log(`[DEBUG] Sending to tokens:`, tokens);

        // Firebase Multicast Message
        const message = {
          notification: {
            title: "New Alert in Your Area!",
            body: `A new ${severity} severity report requires attention.`,
          },
          data: {
            reportId: report._id.toString(),
            type: "new_report",
          },
          tokens: tokens,
        };
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log("Notifications sent:", response.successCount);
        console.log("Failures:", response.failureCount);
        if (response.failureCount > 0) {
          console.log(
            "Failed tokens:",
            response.responses.filter((r) => !r.success)
          );
        }
      }
    } catch (notifyErr) {
      console.error("Failed to send notifications:", notifyErr);
      // Don't fail the request if notification fails
    }

    await Reporter.findByIdAndUpdate(req.user.id, {
      $inc: { reports_posted: 1, karma_points: 5 },
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("new_report", {
        message: "New Help Request Nearby!",
        report: report,
      });
    }

    res
      .status(201)
      .json({
        status: "success",
        data: report,
        ngosNotified: nearbyNGOs.length,
      });
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

    const requestingNGO = await NGO.findById(req.user.id).select(
      "service_radius_km"
    );
    const defaultRadius = (requestingNGO?.service_radius_km || 10) * 1000; // Convert to meters

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius) || defaultRadius, // Default 10km
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

    // --- START NOTIFICATION LOGIC ---
    try {
      // Find the reporter to get their token
      const reporter = await Reporter.findById(report.reporter_id).select(
        "fcmToken"
      );
      if (reporter && reporter.fcmToken) {
        const message = {
          notification: {
            title: "Help is on the way!",
            body: `Your report has been claimed by ${
              req.user.name || "an NGO"
            }.`,
          },
          data: {
            reportId: report._id.toString(),
            type: "report_claimed",
          },
          token: reporter.fcmToken,
        };
        await admin.messaging().send(message);
        console.log("Reporter notified");
      }
    } catch (notifyErr) {
      console.error("Notification error:", notifyErr);
    }
    // --- END NOTIFICATION LOGIC ---

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
      // Include all statuses (Claimed & Resolved)
    })
      .populate("reporter_id", "name phone")
      .sort({ status: 1, updatedAt: -1 }); // 'Claimed' comes before 'Resolved'

    res
      .status(200)
      .json({ status: "success", count: reports.length, data: reports });
  } catch (err) {
    next(err);
  }
};

export const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({
      reporter_id: req.user.id,
    })
      .populate("claimed_by", "name")
      .sort({ createdAt: -1 })
      .limit(10); // Show last 10 reports

    res.status(200).json({
      status: "success",
      count: reports.length,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
};

// Get most recent resolved case for NGO dashboard
export const getRecentResolvedCases = async (req, res, next) => {
  try {
    const recentCases = await Report.find({
      status: "Resolved",
    })
      .populate("reporter_id", "name")
      .populate("claimed_by", "name")
      .sort({ updatedAt: -1 })
      .limit(3);

    res.status(200).json({
      status: "success",
      data: recentCases,
    });
  } catch (err) {
    next(err);
  }
};

// Get public NGO profile
export const getNGOProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ngo = await NGO.findById(id).select(
      "-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires"
    );

    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    // Get recent resolved cases by this NGO
    const recentCases = await Report.find({
      claimed_by: id,
      status: "Resolved",
    })
      .populate("reporter_id", "name")
      .sort({ updatedAt: -1 })
      .limit(5);

    res.status(200).json({
      status: "success",
      data: {
        ngo,
        recentCases,
      },
    });
  } catch (err) {
    next(err);
  }
};
