const mongoose = require("mongoose");

const operationalEmailLogSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["warning", "monthly_report"],
      required: true,
      index: true,
    },
    subject: {
      type: String,
      default: "",
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    recipients: {
      type: [String],
      default: [],
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("OperationalEmailLog", operationalEmailLogSchema);
