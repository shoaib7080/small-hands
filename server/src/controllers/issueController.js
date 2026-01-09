import Issue from "../models/issueModel.js";

export const registerIssue = async (req, res, next) => {
  try {
    const { title, description, category, priority, device_info } = req.body;

    const issue = await Issue.create({
      title,
      description,
      category,
      priority,
      reported_by: {
        user_id: req.user.id,
        user_role: req.user.role,
        user_name: req.user.name || req.user.email,
      },
      device_info,
    });

    res.status(201).json({
      status: "success",
      message: "Issue registered successfully",
      data: issue,
    });
  } catch (err) {
    next(err);
  }
};

export const getIssues = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const issues = await Issue.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: issues.length,
      data: issues,
    });
  } catch (err) {
    next(err);
  }
};

export const updateIssueStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.status(200).json({
      status: "success",
      data: issue,
    });
  } catch (err) {
    next(err);
  }
};
