const mongoose = require("mongoose");

const ITEM_BASED_SERVICES = ["local_shifting", "intercity_moving"];
const PORTER_LABOUR_SERVICE = "porter_labour_service";

const locationSchema = new mongoose.Schema(
  {
    address: {
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
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    floor: {
      type: Number,
      default: 0,
    },

    liftavailable: {
      type: Boolean,
      default: false,
    },
    coordination: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false },
);

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },

    otpVerifiedAt: Date,
  },
  { _id: false },
);

const ItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    itemkey: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    options: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    note: String,
    sizeTag: { type: String, trim: true },
    unitPrice: { type: Number, min: 0, default: 0 },
    lineTotal: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

const SelectedAddonSchema = new mongoose.Schema(
  {
    addonid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AddOnService",
    },

    key: {
      type: String,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
    },

    unit: {
      type: String,
      enum: ["per_unit", "per_room", "per_item", "flat", "percentage"],
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    pricesnapshot: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const StatusSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },

    note: String,

    changedby: {
      type: String,
      default: "Admin",
    },

    chnagesAt: {
      type: Date,
      default: Date.now,
    },
  },

  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    bookingid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customer: {
      type: CustomerSchema,
      required: function () {
        return this.status !== "draft";
      },
    },

    serviceType: {
      type: String,
      required: true,
      enum: [...ITEM_BASED_SERVICES, PORTER_LABOUR_SERVICE],
      index: true,
    },

    draftTokenHash: {
      type: String,
      required: true,
      select: false,
    },

    serviceid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    status: {
      type: String,
      enum: [
        "draft",
        "otp_pending",
        "pending",
        "quote_sent",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "draft",
      index: true,
    },

    currentStep: {
      type: String,
      enum: ["locations", "service_details", "otp", "customer", "quotation", "confirmed"],
      default: "locations",
    },

    pickuplocation: locationSchema,
    droplocation: locationSchema,

    distanceKm: {
      type: Number,
      required: true,
      min: 0,
    },

    scheduledate: Date,
    timeslot: {
      type: String,
      enum: ["morning", "afternoon", "evening", "after_hours", null],
      default: null,
    },

    items: {
      type: [ItemSchema],
      default: [],
    },
    selectedAddons: [SelectedAddonSchema],

    porterLabourDetails: {
      truckType: {
        type: String,
        lowercase: true,
        trim: true,
        required: function () {
          return this.status !== "draft" && this.serviceType === PORTER_LABOUR_SERVICE;
        },
      },
      employeeCount: {
        type: Number,
        min: 1,
        required: function () {
          return this.status !== "draft" && this.serviceType === PORTER_LABOUR_SERVICE;
        },
      },
      hours: {
        type: Number,
        min: 1,
        max: 7,
        required: function () {
          return this.status !== "draft" && this.serviceType === PORTER_LABOUR_SERVICE;
        },
      },
    },

    pricing: {
      currency: { type: String, default: "INR", uppercase: true, trim: true },
      itemTotal: { type: Number, default: 0, min: 0 },
      addOnTotal: { type: Number, default: 0, min: 0 },
      serviceCharge: { type: Number, default: 0, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      totalAmount: { type: Number, default: 0, min: 0 },
      breakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
      calculatedBy: { type: String, enum: ["frontend", "admin"], default: "frontend" },
      submittedAt: Date,
    },

    quoteSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    confirmedAt: Date,

    statusHistory: [StatusSchema],
  },
  {
    timestamps: true,
  },
);

bookingSchema.pre("validate", function () {
  if (this.serviceType === PORTER_LABOUR_SERVICE) {
    this.items = [];
    this.selectedAddons = [];
  }
});

bookingSchema.index({ "customer.mobile": 1, createdAt: -1 });
bookingSchema.index({ scheduledate: 1, status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
