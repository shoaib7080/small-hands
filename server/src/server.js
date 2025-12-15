import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;

//HTTP server for socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // Start Server only after DB connects
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.io ready for connections`);
    });
  })
  .catch((err) => {
    console.error("Database Connection Error:", err);
    process.exit(1); // Stop app if DB fails
  });

// Socket.io Logic Placeholder
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
