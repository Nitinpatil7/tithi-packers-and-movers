const mongoose =  require("mongoose");
const addOnServiceSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    unit: {
      type: String,
      enum: ["global", "flat", "per_unit", "per_item", "per_group", "per_category", "per_room", "percentage"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      default: 0,
      min:0
    },

    appliesToServiceTypes: [
      {
       type: String,
        enum: [
          "local_shifting",
          "intercity_moving",
        ],
      },
    ],

    triggerCategoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ItemCategory",
      },
    ],

    triggerGroupIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ItemGroup",
      },
    ],

    triggerItemIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],

    isOptional: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

addOnServiceSchema.index({ appliesToServiceTypes: 1 });
addOnServiceSchema.index({ triggerCategoryIds: 1 });
addOnServiceSchema.index({ triggerGroupIds: 1 });
addOnServiceSchema.index({ triggerItemIds: 1 });
addOnServiceSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("AddOnService", addOnServiceSchema);
