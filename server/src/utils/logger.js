import winston from "winston";
import "winston-mongodb";

dotenv.config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Write all logs to `combined.log`
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// Logging to MongoDB in production
if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.MongoDB({
      level: "error",
      db: process.env.MONGO_URI,
      options: { useUnifiedTopology: true },
      collection: "server_logs",
      capped: true,
      cappedMax: 10000000, // Limit to 10MB
      metaKey: "meta",
    })
  );
}

// Logging to local during development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.File({ filename: "logs/error.log", level: "error" })
  );
  logger.add(new winston.transports.File({ filename: "logs/combined.log" }));
}

export default logger;
