const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, default: "Tithi Admin" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["super_admin", "admin", "operator"],
      default: "admin",
    },
    isActive: { type: Boolean, default: true, index: true },
    mustChangePassword: { type: Boolean, default: true },
    passwordChangedAt: { type: Date, default: Date.now },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Admin", adminSchema);
