export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (e) {
    let errors = [];

    if (Array.isArray(e?.errors)) {
      errors = e.errors.map((err) => err.message || String(err));
    } else if (Array.isArray(e?.issues)) {
      errors = e.issues.map((issue) => issue.message || String(issue));
    } else if (e?.name === "ZodError" && typeof e?.message === "string") {
      try {
        const parsed = JSON.parse(e.message);
        if (Array.isArray(parsed)) {
          errors = parsed.map((p) => p.message || JSON.stringify(p));
        } else {
          errors = [e.message];
        }
      } catch {
        errors = [e.message];
      }
    } else {
      errors = [e?.message || "Invalid request"];
    }

    return res.status(400).json({
      status: "error",
      errors,
    });
  }
};
