import * as authService from "../services/authService.js";

export const register = async (req, res, next) => {
  try {
    const { role } = req.body;
    let result;

    if (role === "reporter") {
      result = await authService.registerReporter(req.body);
    } else if (role === "ngo") {
      result = await authService.registerNGO(req.body);
    } else {
      throw new Error("Invalid role");
    }

    res.status(201).json({ status: "success", data: result });
  } catch (err) {
    next(err); // Passes to global error handler
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const result = await authService.loginUser(identifier, password);
    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
};
