import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan"; // logging middleware
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import compression from "compression";

const app = express();

// Middleware
app.use(
  compression({
    level: 6,
    threshold: 1024,
  })
);
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows images from Google
  })
);
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    credentials: true,
  })
);
app.use(express.json());

// Routes Placeholder
app.get("/", (req, res) => {
  res.json({ message: "Small Hands API - v1 Active" });
});
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/issues", issueRoutes);

// Swagger Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(notFound);
app.use(errorHandler);

export default app;
