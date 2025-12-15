import * as authService from "../services/authService.js";

export const addTrustedNGO = async (req, res, next) => {
  try {
    // req.user.id comes from the auth middleware (we will add this next)
    const result = await authService.createTrustedNGO(req.body, req.user.id);
    res
      .status(201)
      .json({
        status: "success",
        message: "Trusted NGO created!",
        data: result,
      });
  } catch (err) {
    next(err);
  }
};
