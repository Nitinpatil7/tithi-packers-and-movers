const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },

    customerMobile: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    customerName: {
      type: String,
      trim: true,
    },

    channel: {
      type: String,
      enum: ["sms", "whatsapp"],
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
       "booking_created",
        "quote_sent",
        "status_update",
        "booking_completed",
        "offer",
        "new_branch",
        "service_update",
        "admin_message",
        "admin_broadcast",
      ],
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
      index: true,
    },

    provider: {
      type: String,
      trim: true,
      default: "manual_whatsapp"
    },

    providerMessageId: {
      type: String,
      trim: true,
    },

    providerResponse: {
      type: mongoose.Schema.Types.Mixed,
    },

    errorMessage: {
      type: String,
      trim: true,
    },

    sentAt: {
      type: Date,
    },

    createdBy: {
      type: String,
      enum: ["system", "admin"],
      default: "system",
    },

    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ customerMobile: 1, createdAt: -1 });
notificationSchema.index({ bookingId: 1, createdAt: -1 });

module.exports = mongoose.model("notification", notificationSchema);
