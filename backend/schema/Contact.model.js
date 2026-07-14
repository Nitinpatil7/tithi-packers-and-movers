const mongoose = require("mongoose");
const contactInquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    subject: String,

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["new", "contacted", "resolved", "spam"],
      default: "new",
    },

    adminNotes: String,
  },
  { timestamps: true }
);

contactInquirySchema.index({ status: 1, createdAt: -1 });


module.exports = mongoose.model("contact", contactInquirySchema);