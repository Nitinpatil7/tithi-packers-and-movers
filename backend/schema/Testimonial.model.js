const mongoose = require("mongoose");
const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

     imageUrl: {
      type: String,
      trim: true,
    },
    serviceType: {
      type: String,
      enum: [
        "general",
        "local_shifting",
        "intercity_moving",
        "porter_labour_service",
      ],
      default: "general",
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: true,
       index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
       index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
    linkedBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },
    bookingNumber: {
      type: String,
      trim: true,
      index: true,
    },
    submittedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

testimonialSchema.index({ status: 1, isFeatured: 1, sortOrder: 1 });
testimonialSchema.index({ serviceType: 1, status: 1 });
testimonialSchema.index({ bookingNumber: 1, status: 1 });

module.exports = mongoose.model("testimonial" , testimonialSchema);
