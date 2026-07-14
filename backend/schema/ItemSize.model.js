const mongoose = require("mongoose");

const itemSizeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, uppercase: true, trim: true },
    label: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

itemSizeSchema.index({ isActive: 1, sortOrder: 1, key: 1 });

module.exports = mongoose.model("ItemSize", itemSizeSchema);
