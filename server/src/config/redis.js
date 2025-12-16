import { createClient } from "redis";
import logger from "../utils/logger.js";

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => logger.error("Redis Client Error", err));
client.on("connect", () => logger.info("✅ Redis Connected"));

await client.connect();

export default client;
