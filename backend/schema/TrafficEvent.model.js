const mongoose = require("mongoose");

const trafficEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["page_view", "click"],
      required: true,
      index: true,
    },
    path: {
      type: String,
      default: "",
      index: true,
    },
    label: {
      type: String,
      default: "",
      trim: true,
    },
    referrer: {
      type: String,
      default: "",
      trim: true,
    },
    country: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: "",
    },
    ipHash: {
      type: String,
      default: "",
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { versionKey: false },
);

trafficEventSchema.index({ createdAt: 1, type: 1 });
trafficEventSchema.index({ createdAt: 1, path: 1 });

module.exports = mongoose.model("TrafficEvent", trafficEventSchema);
