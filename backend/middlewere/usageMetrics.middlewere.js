const { recordApiMetric } = require("../utility/metricsBuffer");

const usageMetrics = (req, res, next) => {
  const started = Date.now();

  res.on("finish", () => {
    if (req.originalUrl.startsWith("/api/analytics-track")) return;
    const contentLength = Number(res.getHeader("content-length") || 0);
    recordApiMetric({
      method: req.method,
      path: req.originalUrl.split("?")[0],
      statusCode: res.statusCode,
      durationMs: Date.now() - started,
      responseBytes: contentLength,
      userAgent: req.get("user-agent"),
    });
  });

  next();
};

module.exports = usageMetrics;
