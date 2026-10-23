
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  lazyConnect: true,
  maxRetriesPerRequest: 1,
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (error: Error) => {
  console.error("Redis connection error:", error.message);
});

export default redis;
