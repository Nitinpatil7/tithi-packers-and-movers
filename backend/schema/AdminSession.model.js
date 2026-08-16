const mongoose = require("mongoose");

const adminSessionSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    refreshTokenHash: { type: String, unique: true, sparse: true, index: true },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    lastUsedAt: { type: Date, default: Date.now },
    accessExpiresAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AdminSession", adminSessionSchema);
