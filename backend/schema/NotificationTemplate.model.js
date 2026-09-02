const mongoose = require("mongoose");

const notificationTemplateSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "quote_sent", "confirmed", "in_progress", "completed", "cancelled"],
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    updatedBy: {
      type: String,
      default: "admin",
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("NotificationTemplate", notificationTemplateSchema);
