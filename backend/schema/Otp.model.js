const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ["booking", "admin_password_reset"],
      default: "booking",
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
      select: false,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    purgeAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

otpSchema.index({ mobile: 1, purpose: 1, isUsed: 1, createdAt: -1 });

module.exports = mongoose.model("Otp", otpSchema);
