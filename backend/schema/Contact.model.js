const mongoose = require("mongoose");
const contactInquirySchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["contact_form", "item_search"],
      default: "contact_form",
      index: true,
    },

    type: {
      type: String,
      enum: ["general", "item_search"],
      default: "general",
      index: true,
    },

    searchedTerm: {
      type: String,
      trim: true,
    },

    name: {
      type: String,
      required: function requiredName() { return this.source !== "item_search"; },
      trim: true,
      default: "",
    },

    mobile: {
      type: String,
      required: function requiredMobile() { return this.source !== "item_search"; },
      trim: true,
      default: "",
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
