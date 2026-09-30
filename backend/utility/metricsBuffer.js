const crypto = require("crypto");
const ApiMetric = require("../schema/ApiMetric.model");
const TrafficEvent = require("../schema/TrafficEvent.model");
const logger = require("./logger");

const MAX_BUFFER_SIZE = Number(process.env.METRICS_BUFFER_MAX_SIZE || 500);
const FLUSH_INTERVAL_MS = Number(process.env.METRICS_FLUSH_INTERVAL_MS || 60_000);
const IP_HASH_SECRET = process.env.METRICS_IP_HASH_SECRET || process.env.JWT_SECRET || "tithi-metrics";

const apiMetrics = [];
const trafficEvents = [];
let flushTimer = null;

const hashIp = (ip = "") => {
  if (!ip) return "";
  return crypto.createHmac("sha256", IP_HASH_SECRET).update(String(ip)).digest("hex").slice(0, 20);
};

const safePath = (path = "") => String(path || "").slice(0, 300);
const safeText = (value = "", max = 300) => String(value || "").slice(0, max);

const flushMetrics = async () => {
  const apiBatch = apiMetrics.splice(0, apiMetrics.length);
  const trafficBatch = trafficEvents.splice(0, trafficEvents.length);
  try {
    await Promise.all([
      apiBatch.length ? ApiMetric.insertMany(apiBatch, { ordered: false }) : null,
      trafficBatch.length ? TrafficEvent.insertMany(trafficBatch, { ordered: false }) : null,
    ]);
  } catch (error) {
    logger.warn("Metrics flush skipped", { error: error.message });
  }
};

const scheduleFlush = () => {
  if (flushTimer || process.env.METRICS_COLLECTION_ENABLED === "false") return;
  flushTimer = setInterval(() => {
    flushMetrics().catch((error) => logger.warn("Metrics flush failed", { error: error.message }));
  }, FLUSH_INTERVAL_MS);
  if (typeof flushTimer.unref === "function") flushTimer.unref();
};

const pushAndMaybeFlush = (buffer, item) => {
  if (process.env.METRICS_COLLECTION_ENABLED === "false") return;
  scheduleFlush();
  buffer.push(item);
  if (buffer.length >= MAX_BUFFER_SIZE) {
    flushMetrics().catch((error) => logger.warn("Metrics overflow flush failed", { error: error.message }));
  }
};

const recordApiMetric = (metric = {}) => {
  pushAndMaybeFlush(apiMetrics, {
    method: safeText(metric.method || "GET", 16).toUpperCase(),
    path: safePath(metric.path),
    statusCode: Number(metric.statusCode || 0),
    durationMs: Math.max(0, Number(metric.durationMs || 0)),
    responseBytes: Math.max(0, Number(metric.responseBytes || 0)),
    userAgent: safeText(metric.userAgent, 500),
    createdAt: metric.createdAt || new Date(),
  });
};

const recordTrafficEvent = (event = {}, req = {}) => {
  const type = event.type === "click" ? "click" : "page_view";
  pushAndMaybeFlush(trafficEvents, {
    type,
    path: safePath(event.path || req.path || ""),
    label: safeText(event.label, 160),
    referrer: safeText(event.referrer || req.get?.("referer") || req.get?.("referrer"), 500),
    country: safeText(event.country || req.get?.("cf-ipcountry") || "", 8),
    userAgent: safeText(event.userAgent || req.get?.("user-agent"), 500),
    ipHash: hashIp(req.ip || req.headers?.["x-forwarded-for"] || ""),
    createdAt: new Date(),
  });
};

module.exports = {
  flushMetrics,
  recordApiMetric,
  recordTrafficEvent,
  scheduleFlush,
};
