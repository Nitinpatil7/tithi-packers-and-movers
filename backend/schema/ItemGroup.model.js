const mongoose = require("mongoose");

const itemGroupSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, lowercase: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ItemCategory", required: true, index: true },
    section: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, trim: true, default: null },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

itemGroupSchema.index({ categoryId: 1, key: 1 }, { unique: true });
itemGroupSchema.index({ categoryId: 1, isActive: 1, sortOrder: 1, name: 1 });

module.exports = mongoose.model("ItemGroup", itemGroupSchema);
