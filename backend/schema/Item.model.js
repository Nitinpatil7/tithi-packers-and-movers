const mongoose = require("mongoose");

const itemSizeVariantSchema = new mongoose.Schema(
  {
    sizeId: { type: mongoose.Schema.Types.ObjectId, ref: "ItemSize", required: true },
    sizeKey: { type: String, required: true, uppercase: true, trim: true },
    label: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true },
);

const itemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemCategory",
      required: true,
      index: true,
    },
    section: { type: String, required: true, trim: true, index: true },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemGroup",
      required: true,
      index: true,
    },
    group: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    sizes: { type: [itemSizeVariantSchema], required: true, default: [] },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

itemSchema.index({ categoryId: 1, groupId: 1, sortOrder: 1, name: 1 });

module.exports = mongoose.model("Item", itemSchema, "itempricings");
