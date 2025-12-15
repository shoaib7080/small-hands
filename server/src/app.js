import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan"; // logging middleware
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: "error", message: "Something went wrong!" });
});

export default app;
