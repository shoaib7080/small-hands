import Report from "../models/reportModel.js";

// 1. Create a Report
export const createReport = async (req, res, next) => {
  try {
    const { type, description, severity, latitude, longitude, images } =
      req.body;

    const report = await Report.create({
      type,
      description,
      severity,
      images, // Array of URLs
      reporter_id: req.user.id, // Comes from authMiddleware
      location: { type: "Point", coordinates: [longitude, latitude] },
    });

    // TODO: Emit Socket.io event here later

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

    res.status(200).json({ status: "success", data: report });
  } catch (err) {
    next(err);
  }
};
