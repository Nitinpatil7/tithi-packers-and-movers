const mongoose = require("mongoose");
const branchSchema = new mongoose.Schema(
  {
    branchName: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      default: "Gujarat",
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    coordinates: {
      lat: Number,
      lng: Number,
    },

    isMainBranch: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
     sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);
branchSchema.index({ isActive: 1, sortOrder: 1 });
branchSchema.index({ city: 1, isActive: 1 });


module.exports = mongoose.model("branch" , branchSchema);