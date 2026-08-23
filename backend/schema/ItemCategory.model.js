const mongoose = require("mongoose");

const itemCategorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true, default: "" },
    icon: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

itemCategorySchema.index({ isActive: 1, sortOrder: 1, name: 1 });

module.exports = mongoose.model("ItemCategory", itemCategorySchema);
