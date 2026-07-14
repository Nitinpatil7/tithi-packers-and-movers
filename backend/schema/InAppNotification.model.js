const mongoose = require("mongoose");

const inAppNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["new_booking", "booking_reminder", "system"],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

inAppNotificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model("InAppNotification", inAppNotificationSchema);
