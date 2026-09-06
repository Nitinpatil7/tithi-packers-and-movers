const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    html: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const emailNotificationSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "booking_confirmation",
      unique: true,
      index: true,
    },
    recipients: {
      type: [String],
      default: [],
    },
    template: {
      type: emailTemplateSchema,
      required: true,
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

module.exports = mongoose.model("EmailNotificationSetting", emailNotificationSettingSchema);
