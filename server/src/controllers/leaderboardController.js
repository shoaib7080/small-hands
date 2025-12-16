import Reporter from "../models/reporterModel.js";
import NGO from "../models/ngoModel.js";

export const getLeaderboard = async (req, res, next) => {
  try {
    // Get Top 10 Reporters by Karma
    const topReporters = await Reporter.find({})
      .sort({ karma_points: -1 })
      .limit(10)
      .select("name karma_points badges");

    // Get Top 10 NGOs by Impact Score
    const topNGOs = await NGO.find({})
      .sort({ impact_score: -1 })
      .limit(10)
      .select("name impact_score verification_status");

    res.status(200).json({
      status: "success",
      data: {
        reporters: topReporters,
        ngos: topNGOs,
      },
    });
  } catch (err) {
    next(err);
  }
};
