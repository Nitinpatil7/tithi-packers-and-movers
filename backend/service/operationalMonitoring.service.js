const mongoose = require("mongoose");
const { getRedisClient } = require("../config/redis");
const ApiMetric = require("../schema/ApiMetric.model");
const TrafficEvent = require("../schema/TrafficEvent.model");
const OperationalEmailLog = require("../schema/OperationalEmailLog.model");
const Booking = require("../schema/Booking.model");
const adminAnalyticsService = require("./adminAnalytics.service");
const { sendOperationalEmail } = require("./emailNotification.service");
const { flushMetrics } = require("../utility/metricsBuffer");
const { generateMonthlyReportPdf, generateWarningPdf } = require("../utility/operationalReportPdf");
const logger = require("../utility/logger");

const DAY_MS = 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = Number(process.env.INFRA_CHECK_INTERVAL_MS || 5 * 60 * 1000);
const REPORT_CHECK_INTERVAL_MS = Number(process.env.MONTHLY_REPORT_CHECK_INTERVAL_MS || 60 * 60 * 1000);
const ALERT_COOLDOWN_MS = Number(process.env.INFRA_ALERT_COOLDOWN_MS || 30 * 60 * 1000);
const HIGH_LATENCY_MS = Number(process.env.INFRA_HIGH_LATENCY_MS || 2000);
const HIGH_TRAFFIC_15M = Number(process.env.INFRA_HIGH_TRAFFIC_15M || 250);
const BANDWIDTH_WARNING_BYTES_DAY = Number(process.env.RENDER_BANDWIDTH_WARNING_BYTES_DAY || 150 * 1024 * 1024);

let started = false;

const formatMonthKey = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  return `${parts.find((part) => part.type === "year").value}-${parts.find((part) => part.type === "month").value}`;
};

const monthRange = (date = new Date()) => {
  const key = formatMonthKey(date);
  const [year, month] = key.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1, -5, -30));
  const end = month === 12
    ? new Date(Date.UTC(year + 1, 0, 1, -5, -30))
    : new Date(Date.UTC(year, month, 1, -5, -30));
  const endDate = new Date(end.getTime() - DAY_MS);
  return {
    key,
    start,
    end,
    startDate: `${key}-01`,
    endDate: endDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
    label: `${key}-01 to ${endDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })}`,
  };
};

const isLastDayInKolkata = (date = new Date()) => {
  const nowKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const tomorrowKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date.getTime() + DAY_MS));
  return nowKey.slice(0, 7) !== tomorrowKey.slice(0, 7);
};

const bytesLabel = (bytes = 0) => {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};

const aggregateTraffic = async (start, end) => {
  const [typeRows, pageRows, clickRows, referrerRows, countryRows, uniqueRows] = await Promise.all([
    TrafficEvent.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
    TrafficEvent.aggregate([
      { $match: { type: "page_view", createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    TrafficEvent.aggregate([
      { $match: { type: "click", createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: { label: "$label", path: "$path" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    TrafficEvent.aggregate([
      { $match: { type: "page_view", createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: "$referrer", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    TrafficEvent.aggregate([
      { $match: { type: "page_view", createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    TrafficEvent.distinct("ipHash", { createdAt: { $gte: start, $lt: end }, ipHash: { $ne: "" } }),
  ]);

  const byType = Object.fromEntries(typeRows.map((row) => [row._id, row.count]));
  return {
    totalViews: byType.page_view || 0,
    totalClicks: byType.click || 0,
    uniqueVisitors: uniqueRows.length,
    topPages: pageRows.map((row) => ({ path: row._id || "/", count: row.count })),
    topClicks: clickRows.map((row) => ({ label: row._id?.label || "", path: row._id?.path || "", count: row.count })),
    topReferrers: referrerRows.map((row) => ({ referrer: row._id || "Direct", count: row.count })),
    topCountries: countryRows.map((row) => ({ country: row._id || "Unknown", count: row.count })),
  };
};

const aggregateApi = async (start, end) => {
  const [summaryRows, slowRows] = await Promise.all([
    ApiMetric.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: null,
          requests: { $sum: 1 },
          failures: { $sum: { $cond: [{ $gte: ["$statusCode", 500] }, 1, 0] } },
          slowApis: { $sum: { $cond: [{ $gte: ["$durationMs", HIGH_LATENCY_MS] }, 1, 0] } },
          avgDurationMs: { $avg: "$durationMs" },
          responseBytes: { $sum: "$responseBytes" },
        },
      },
    ]),
    ApiMetric.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: "$path",
          requests: { $sum: 1 },
          avgDurationMs: { $avg: "$durationMs" },
          maxDurationMs: { $max: "$durationMs" },
          failures: { $sum: { $cond: [{ $gte: ["$statusCode", 500] }, 1, 0] } },
        },
      },
      { $sort: { avgDurationMs: -1 } },
      { $limit: 10 },
    ]),
  ]);
  const summary = summaryRows[0] || {};
  return {
    requests: summary.requests || 0,
    failures: summary.failures || 0,
    slowApis: summary.slowApis || 0,
    avgDurationMs: Math.round(summary.avgDurationMs || 0),
    responseBytes: summary.responseBytes || 0,
    bandwidthLabel: bytesLabel(summary.responseBytes || 0),
    topSlowRoutes: slowRows.map((row) => ({
      path: row._id || "/",
      requests: row.requests,
      avgDurationMs: row.avgDurationMs,
      maxDurationMs: row.maxDurationMs,
      failures: row.failures,
    })),
  };
};

const buildMonthlyReport = async (range = monthRange()) => {
  await flushMetrics();
  const [traffic, api, dashboard, analytics] = await Promise.all([
    aggregateTraffic(range.start, range.end),
    aggregateApi(range.start, range.end),
    adminAnalyticsService.getDashboard({ range: "custom", startDate: range.startDate, endDate: range.endDate }),
    adminAnalyticsService.getAnalytics({ range: "custom", startDate: range.startDate, endDate: range.endDate }),
  ]);
  const warnings = [];
  if (api.failures > 0) warnings.push({ title: "API failures detected", message: `${api.failures} backend requests returned 5xx errors.` });
  if (api.slowApis > 0) warnings.push({ title: "Slow API requests detected", message: `${api.slowApis} requests crossed ${HIGH_LATENCY_MS} ms.` });
  if (api.responseBytes > BANDWIDTH_WARNING_BYTES_DAY * 20) warnings.push({ title: "Bandwidth risk", message: `Estimated API response bandwidth is ${api.bandwidthLabel}.` });

  return {
    range,
    rangeLabel: range.label,
    traffic,
    api,
    bookings: {
      ...(dashboard.stats || {}),
      totalBookings: dashboard.stats?.totalBookings || 0,
      estimatedRevenue: analytics.estimatedRevenue || 0,
      averageBookingValue: analytics.averageBookingValue || 0,
      serviceBreakdown: dashboard.serviceBreakdown || [],
    },
    warnings,
  };
};

const checkRedisStatus = async () => {
  try {
    const redis = await getRedisClient();
    const started = Date.now();
    const pong = await Promise.race([
      redis.ping(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Redis ping timed out")), 1500)),
    ]);
    return { ok: pong === "PONG", status: pong === "PONG" ? "connected" : "unhealthy", latencyMs: Date.now() - started };
  } catch (error) {
    return { ok: false, status: "disconnected", message: error.message };
  }
};

const buildWarning = async () => {
  await flushMetrics();
  const now = new Date();
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - DAY_MS);
  const [redis, api15m, api1h, traffic15m, booking15m, apiDay] = await Promise.all([
    checkRedisStatus(),
    aggregateApi(fifteenMinutesAgo, now),
    aggregateApi(oneHourAgo, now),
    TrafficEvent.countDocuments({ createdAt: { $gte: fifteenMinutesAgo, $lt: now } }),
    Booking.countDocuments({ createdAt: { $gte: fifteenMinutesAgo, $lt: now }, status: { $ne: "draft" } }),
    aggregateApi(oneDayAgo, now),
  ]);

  const mongoOk = mongoose.connection.readyState === 1;
  const problems = [];
  const actions = [];
  if (!mongoOk) {
    problems.push("MongoDB is disconnected");
    actions.push("Open MongoDB Atlas and check cluster status, connection limit, and IP/network access.");
  }
  if (!redis.ok) {
    problems.push(`Redis is ${redis.status}`);
    actions.push("Open Upstash and check command quota, connection errors, and REST/TCP credentials.");
  }
  if (api15m.failures >= 3) {
    problems.push(`${api15m.failures} API failures in the last 15 minutes`);
    actions.push("Check Render logs for stack traces on the failing API routes.");
  }
  if (api15m.slowApis >= 5 || api1h.avgDurationMs >= HIGH_LATENCY_MS) {
    problems.push("API latency is repeatedly high");
    actions.push("Review the slow route list and Mongo indexes for the heaviest endpoint.");
  }
  if (apiDay.responseBytes >= BANDWIDTH_WARNING_BYTES_DAY) {
    problems.push(`Estimated backend bandwidth reached ${apiDay.bandwidthLabel} today`);
    actions.push("Check Render bandwidth, confirm CDN cache hit rate, and look for repeated large responses.");
  }
  if (traffic15m >= HIGH_TRAFFIC_15M) {
    problems.push(`High traffic spike: ${traffic15m} tracked events in 15 minutes`);
    actions.push("Watch Render CPU/memory and consider temporarily increasing cache TTLs or upgrading the instance.");
  }

  if (!problems.length) return null;
  return {
    key: problems.join("|").toLowerCase().replace(/[^a-z0-9|]+/g, "-").slice(0, 160),
    severity: problems.some((item) => /disconnected|failures|bandwidth/i.test(item)) ? "critical" : "warning",
    title: problems[0],
    message: problems.join(". "),
    stats: {
      apiFailures: api15m.failures,
      slowApis: api15m.slowApis,
      traffic15m,
      bookings15m: booking15m,
      mongoStatus: mongoOk ? "connected" : "disconnected",
      redisStatus: redis.status,
      bandwidthToday: apiDay.bandwidthLabel,
    },
    actions,
  };
};

const warningHtml = (warning) => `<div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6">
  <h2 style="margin:0 0 12px;color:#b91c1c">Tithi Packers -- Warning</h2>
  <p><strong>${warning.title}</strong></p>
  <p>${warning.message}</p>
  <div style="padding:14px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px">
    <p><strong>Mongo:</strong> ${warning.stats.mongoStatus}</p>
    <p><strong>Redis:</strong> ${warning.stats.redisStatus}</p>
    <p><strong>API failures:</strong> ${warning.stats.apiFailures}</p>
    <p><strong>Slow APIs:</strong> ${warning.stats.slowApis}</p>
    <p><strong>Traffic last 15 min:</strong> ${warning.stats.traffic15m}</p>
    <p><strong>Bandwidth today:</strong> ${warning.stats.bandwidthToday}</p>
  </div>
  <p>Detailed PDF is attached.</p>
</div>`;

const reportHtml = (report) => `<div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6">
  <h2 style="margin:0 0 12px;color:#0f766e">Tithi Packers Monthly Report</h2>
  <p><strong>Period:</strong> ${report.rangeLabel}</p>
  <p><strong>Views:</strong> ${report.traffic.totalViews} &nbsp; <strong>Clicks:</strong> ${report.traffic.totalClicks} &nbsp; <strong>Bookings:</strong> ${report.bookings.totalBookings}</p>
  <p><strong>Estimated revenue:</strong> ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(report.bookings.estimatedRevenue)}</p>
  <p><strong>API bandwidth estimate:</strong> ${report.api.bandwidthLabel}</p>
  ${report.warnings.length ? `<p style="color:#b91c1c"><strong>Warnings:</strong> ${report.warnings.map((item) => item.title).join(", ")}</p>` : "<p>No critical warnings in this report.</p>"}
  <p>Full designed PDF report is attached.</p>
</div>`;

const sendWarningIfNeeded = async () => {
  if (process.env.INFRA_ALERTS_ENABLED === "false") return null;
  const warning = await buildWarning();
  if (!warning) return null;
  const cooldownDate = new Date(Date.now() - ALERT_COOLDOWN_MS);
  const recent = await OperationalEmailLog.findOne({
    type: "warning",
    key: warning.key,
    sentAt: { $gte: cooldownDate },
  }).lean();
  if (recent) return null;

  const pdf = await generateWarningPdf(warning);
  const subject = "Tithi Packers -- Warning";
  const sent = await sendOperationalEmail({
    subject,
    html: warningHtml(warning),
    attachments: [{
      filename: `Tithi-Packers-Warning-${Date.now()}.pdf`,
      content: pdf,
      contentType: "application/pdf",
    }],
    logLabel: "Operational warning email",
  });
  if (sent) {
    await OperationalEmailLog.findOneAndUpdate(
      { key: warning.key },
      { $set: { key: warning.key, type: "warning", subject, recipients: sent.recipients, meta: warning, sentAt: new Date() } },
      { upsert: true },
    );
  }
  return warning;
};

const sendMonthlyReportIfDue = async (force = false) => {
  if (process.env.MONTHLY_REPORT_EMAILS === "false") return null;
  if (!force && !isLastDayInKolkata(new Date())) return null;
  const range = monthRange(new Date());
  const key = `monthly-report:${range.key}`;
  const existing = await OperationalEmailLog.findOne({ key }).lean();
  if (existing && !force) return null;

  const report = await buildMonthlyReport(range);
  const pdf = await generateMonthlyReportPdf(report);
  const subject = report.warnings.length ? "Tithi Packers Monthly Report -- Warning" : "Tithi Packers Monthly Report";
  const sent = await sendOperationalEmail({
    subject,
    html: reportHtml(report),
    attachments: [{
      filename: `Tithi-Packers-Monthly-Report-${range.key}.pdf`,
      content: pdf,
      contentType: "application/pdf",
    }],
    logLabel: "Monthly report email",
  });
  if (sent) {
    await OperationalEmailLog.findOneAndUpdate(
      { key },
      { $setOnInsert: { key, type: "monthly_report", subject, recipients: sent.recipients, meta: { range } } },
      { upsert: true },
    );
  }
  return report;
};

const startOperationalMonitoring = () => {
  if (started || process.env.OPERATIONAL_MONITORING_ENABLED === "false") return;
  started = true;
  const runWarning = () => sendWarningIfNeeded().catch((error) => logger.warn("Operational warning check failed", { error: error.message }));
  const runReport = () => sendMonthlyReportIfDue().catch((error) => logger.warn("Monthly report check failed", { error: error.message }));
  setTimeout(runWarning, 20_000).unref?.();
  setTimeout(runReport, 30_000).unref?.();
  const warningTimer = setInterval(runWarning, CHECK_INTERVAL_MS);
  const reportTimer = setInterval(runReport, REPORT_CHECK_INTERVAL_MS);
  warningTimer.unref?.();
  reportTimer.unref?.();
  logger.info("Operational monitoring scheduler started", {
    checkIntervalMs: CHECK_INTERVAL_MS,
    reportCheckIntervalMs: REPORT_CHECK_INTERVAL_MS,
  });
};

module.exports = {
  buildMonthlyReport,
  buildWarning,
  monthRange,
  sendMonthlyReportIfDue,
  sendWarningIfNeeded,
  startOperationalMonitoring,
};
