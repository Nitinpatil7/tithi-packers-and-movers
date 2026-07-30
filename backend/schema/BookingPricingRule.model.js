const mongoose = require("mongoose");
const { SERVICE_TYPE_VALUES } = require("../constants/serviceTypes");

const SIZE_KEYS = ["XS", "S", "M", "L", "XL", "XXL"];

const freeItemAllowanceSchema = new mongoose.Schema(
  {
    sizeKey: { type: String, required: true, uppercase: true, trim: true, enum: SIZE_KEYS },
    quantity: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const distanceSlabSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "" },
    fromKm: { type: Number, required: true, min: 0 },
    toKm: { type: Number, min: 0, default: null },
    ratePerKm: { type: Number, required: true, min: 0, default: 0 },
    isFree: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true },
);

const floorSlabSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "" },
    fromFloor: { type: Number, required: true, min: 0 },
    toFloor: { type: Number, min: 0, default: null },
    charge: { type: Number, required: true, min: 0, default: 0 },
    withLiftCharge: { type: Number, min: 0, default: 0 },
    withoutLiftCharge: { type: Number, min: 0, default: 0 },
    isFree: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true },
);

const liftPricingSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    withLiftCharge: { type: Number, min: 0, default: 0 },
    withoutLiftCharge: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const truckRateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    capacityLabel: { type: String, trim: true, default: "" },
    capacityKg: { type: Number, min: 0, default: 0 },
    image: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0, default: 0 },
    isFree: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true },
);

const hourlyRateSchema = new mongoose.Schema(
  {
    hours: { type: Number, required: true, min: 1 },
    label: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0, default: 0 },
    isFree: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true },
);

const employeeRateSchema = new mongoose.Schema(
  {
    employees: { type: Number, required: true, min: 1 },
    label: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0, default: 0 },
    isFree: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true },
);

const bookingPricingRuleSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      required: true,
      unique: true,
      enum: SERVICE_TYPE_VALUES,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    currency: { type: String, uppercase: true, trim: true, default: "INR" },
    basePrice: { type: Number, required: true, min: 0, default: 1499 },
    freeItemAllowance: {
      type: [freeItemAllowanceSchema],
      default: () => [
        { sizeKey: "XS", quantity: 4 },
        { sizeKey: "S", quantity: 3 },
        { sizeKey: "M", quantity: 1 },
        { sizeKey: "L", quantity: 1 },
        { sizeKey: "XL", quantity: 1 },
        { sizeKey: "XXL", quantity: 1 },
      ],
    },
    distancePricing: {
      enabled: { type: Boolean, default: true },
      slabs: { type: [distanceSlabSchema], default: [] },
    },
    floorPricing: {
      enabled: { type: Boolean, default: true },
      slabs: { type: [floorSlabSchema], default: [] },
    },
    liftPricing: {
      type: liftPricingSchema,
      default: () => ({ enabled: true, withLiftCharge: 0, withoutLiftCharge: 0 }),
    },
    labourPricing: {
      enabled: { type: Boolean, default: false },
      trucks: { type: [truckRateSchema], default: [] },
      employeeRates: { type: [employeeRateSchema], default: [] },
      hourlyRates: { type: [hourlyRateSchema], default: [] },
    },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

bookingPricingRuleSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("BookingPricingRule", bookingPricingRuleSchema);
