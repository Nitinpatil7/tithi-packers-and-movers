const path = require("path");
const mongoose = require("mongoose");
const IORedis = require("ioredis");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const maskUrl = (value = "") => String(value).replace(/\/\/.*@/, "//***@");

const checkMongo = async () => {
  if (!process.env.MONGO_URI) return { ok: false, message: "MONGO_URI is missing" };
  const started = performance.now();
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    const result = await mongoose.connection.db.admin().ping();
    return {
      ok: result?.ok === 1,
      status: result?.ok === 1 ? "connected" : "unhealthy",
      durationMs: Math.round(performance.now() - started),
    };
  } catch (error) {
    return {
      ok: false,
      status: "disconnected",
      message: error.message,
      code: error.code,
      durationMs: Math.round(performance.now() - started),
    };
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

const checkRedis = async () => {
  const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  const redis = new IORedis(url, {
    lazyConnect: true,
    connectTimeout: 4000,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    retryStrategy: null,
  });
  redis.on("error", () => {});
  const started = performance.now();
  try {
    await redis.connect();
    const pong = await redis.ping();
    return {
      ok: pong === "PONG",
      status: pong === "PONG" ? "connected" : "unhealthy",
      url: maskUrl(url),
      durationMs: Math.round(performance.now() - started),
    };
  } catch (error) {
    return {
      ok: false,
      status: "disconnected",
      url: maskUrl(url),
      message: error.message,
      code: error.code,
      durationMs: Math.round(performance.now() - started),
    };
  } finally {
    redis.disconnect();
  }
};

Promise.all([checkMongo(), checkRedis()])
  .then(([mongo, redis]) => {
    console.log(JSON.stringify({ mongo, redis }, null, 2));
    process.exit(mongo.ok && redis.ok ? 0 : 1);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
