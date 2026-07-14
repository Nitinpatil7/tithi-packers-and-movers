const mongoose = require("mongoose");
const legalPageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "privacy_policy",
        "terms_conditions",
        "refund_policy",
        "cancellation_policy",
      ],
      required: true,
      unique: true,
       index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("legal" , legalPageSchema);