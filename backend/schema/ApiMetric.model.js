const mongoose = require("mongoose");

const apiMetricSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: true,
      index: true,
    },
    path: {
      type: String,
      required: true,
      index: true,
    },
    statusCode: {
      type: Number,
      required: true,
      index: true,
    },
    durationMs: {
      type: Number,
      required: true,
    },
    responseBytes: {
      type: Number,
      default: 0,
    },
    userAgent: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { versionKey: false },
);

apiMetricSchema.index({ createdAt: 1, path: 1 });
apiMetricSchema.index({ createdAt: 1, statusCode: 1 });

module.exports = mongoose.model("ApiMetric", apiMetricSchema);
