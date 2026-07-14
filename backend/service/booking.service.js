const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Booking = require("../schema/Booking.model");
const Otp = require("../schema/Otp.model");
const ApiError = require("../utility/apierror");
const inAppNotificationService = require("./inAppNotification.service");
const { normalizeMobile } = require("./otp.service");
const whatsappService = require("./whatsapp.service");

const ITEM_SERVICES = ["local_shifting", "intercity_moving"];
const ALLOWED_DRAFT_FIELDS = [
  "pickuplocation",
  "droplocation",
  "distanceKm",
  "items",
  "selectedAddons",
  "pricing",
  "porterLabourDetails",
  "scheduledate",
  "timeslot",
  "currentStep",
];

const createBookingId = async () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    const bookingid = `TPM-${date}-${suffix}`;
    if (!(await Booking.exists({ bookingid }))) return bookingid;
  }
  throw new ApiError(500, "Unable to generate booking ID");
};

const requireDraftAccess = async (bookingid, token) => {
  const booking = await Booking.findOne({ bookingid }).select("+draftTokenHash");
  if (!booking) throw new ApiError(404, "Booking not found");
  if (!token || !(await bcrypt.compare(token, booking.draftTokenHash))) {
    throw new ApiError(401, "Invalid draft access token");
  }
  return booking;
};

const createDraft = async (payload) => {
  const draftToken = crypto.randomBytes(24).toString("hex");
  const booking = await Booking.create({
    bookingid: await createBookingId(),
    draftTokenHash: await bcrypt.hash(draftToken, 10),
    serviceType: payload.serviceType,
    pickuplocation: payload.pickuplocation,
    droplocation: payload.droplocation,
    distanceKm: payload.distanceKm,
    porterLabourDetails: payload.porterLabourDetails,
    scheduledate: payload.scheduledate,
    timeslot: payload.timeslot,
    status: "draft",
    currentStep: "locations",
  });
  const data = booking.toObject();
  delete data.draftTokenHash;
  return { booking: data, draftToken };
};

const updateDraft = async (bookingid, token, payload) => {
  const booking = await requireDraftAccess(bookingid, token);
  if (booking.status !== "draft") throw new ApiError(409, "Confirmed booking cannot be edited as a draft");
  ALLOWED_DRAFT_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) {
      booking[field] = field === "pricing"
        ? normalizeSubmittedPricing(payload[field], "frontend")
        : payload[field];
    }
  });
  await booking.save();
  const result = booking.toObject();
  delete result.draftTokenHash;
  return result;
};

const normalizeSubmittedPricing = (pricing, calculatedBy = "frontend") => {
  if (!pricing || typeof pricing !== "object") throw new ApiError(400, "Frontend-calculated pricing is required");
  const numericFields = ["itemTotal", "addOnTotal", "serviceCharge", "discount", "tax", "totalAmount"];
  const result = { ...pricing, calculatedBy, submittedAt: new Date() };
  numericFields.forEach((field) => {
    const value = Number(pricing[field] || 0);
    if (!Number.isFinite(value) || value < 0) throw new ApiError(400, `${field} must be a non-negative number`);
    result[field] = value;
  });
  if (!Number.isFinite(Number(pricing.totalAmount))) throw new ApiError(400, "totalAmount is required");
  result.currency = String(pricing.currency || "INR").toUpperCase();
  return result;
};

const buildClientSnapshot = (booking, pricing, source = "frontend") => ({
  submittedAt: new Date(),
  source,
  pricing: normalizeSubmittedPricing(pricing, source),
  items: booking.items.map((item) => item.toObject ? item.toObject() : item),
  selectedAddons: booking.selectedAddons.map((item) => item.toObject ? item.toObject() : item),
});

const previewQuote = async (bookingid, token) => {
  const booking = await requireDraftAccess(bookingid, token);
  if (!booking.pricing?.submittedAt) {
    throw new ApiError(400, "Submit frontend-calculated pricing in the draft first");
  }
  return buildClientSnapshot(booking, booking.pricing, "frontend");
};

const confirmBooking = async (bookingid, token, payload) => {
  const booking = await requireDraftAccess(bookingid, token);
  if (booking.status !== "draft") throw new ApiError(409, "Booking is already confirmed");
  const mobile = normalizeMobile(payload.customer?.mobile);
  const otpRequired = process.env.BOOKING_REQUIRE_OTP === "true";
  let otpVerification = null;
  if (otpRequired) {
    const verificationWindow = Number(process.env.OTP_VERIFICATION_WINDOW_MINUTES || 15);
    otpVerification = await Otp.findOne({
      _id: payload.verificationId,
      mobile,
      purpose: "booking",
      isUsed: true,
      verifiedAt: { $gte: new Date(Date.now() - verificationWindow * 60 * 1000) },
    });
    if (!otpVerification) throw new ApiError(400, "Valid recent OTP verification is required");
  }

  booking.customer = {
    ...payload.customer,
    mobile,
    otpVerified: !otpRequired || Boolean(otpVerification),
    otpVerifiedAt: otpVerification?.verifiedAt || null,
  };
  booking.status = "pending";
  booking.currentStep = "confirmed";
  const submittedPricing = payload.pricing || booking.pricing;
  const quote = buildClientSnapshot(booking, submittedPricing, "frontend");
  booking.pricing = quote.pricing;
  booking.quoteSnapshot = quote;
  booking.confirmedAt = new Date();
  booking.statusHistory.push({
    status: "pending",
    note: otpRequired
      ? "Booking confirmed after OTP verification"
      : "Booking confirmed while OTP verification was disabled",
    changedby: "Customer",
  });
  await booking.save();
  await inAppNotificationService.createNewBookingNotification(booking);
  await whatsappService.sendBookingConfirmation(booking);
  const result = booking.toObject();
  delete result.draftTokenHash;
  return result;
};

const trackBooking = async (bookingid, mobileInput) => {
  const filter = { bookingid, status: { $ne: "draft" } };
  if (mobileInput) filter["customer.mobile"] = normalizeMobile(mobileInput);
  const booking = await Booking.findOne(filter).select(
    "bookingid serviceType status currentStep scheduledate timeslot pickuplocation droplocation pricing quoteSnapshot statusHistory confirmedAt createdAt",
  );
  if (!booking) throw new ApiError(404, "Booking not found");
  return booking;
};

const trackBookingsByMobile = async (mobileInput) => {
  const mobile = normalizeMobile(mobileInput);
  return Booking.find({ "customer.mobile": mobile, status: { $ne: "draft" } })
    .select("bookingid serviceType status currentStep scheduledate timeslot pickuplocation droplocation pricing.totalAmount quoteSnapshot statusHistory confirmedAt createdAt")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
};

const getAllBookings = async (query = {}) => {
  const filter = { status: { $ne: "draft" } };
  if (query.status && query.status !== "draft") filter.status = query.status;
  if (query.serviceType) filter.serviceType = query.serviceType;
  if (query.mobile) filter["customer.mobile"] = normalizeMobile(query.mobile);
  return Booking.find(filter).sort({ createdAt: -1 }).limit(Math.min(Number(query.limit) || 100, 200));
};

const getBookingById = async (bookingid) => {
  const booking = await Booking.findOne({ bookingid });
  if (!booking) throw new ApiError(404, "Booking not found");
  return booking;
};

const getBookingCustomers = async (query = {}) => {
  const match = { status: { $nin: ["draft"] }, "customer.mobile": { $exists: true, $ne: "" } };
  if (query.mobile) match["customer.mobile"] = normalizeMobile(query.mobile);
  const search = String(query.search || "").trim();
  if (search) {
    match.$or = [
      { "customer.name": { $regex: search, $options: "i" } },
      { "customer.email": { $regex: search, $options: "i" } },
      { "customer.mobile": { $regex: search.replace(/\D/g, ""), $options: "i" } },
    ].filter((item) => Object.values(item)[0].$regex !== "");
  }

  return Booking.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$customer.mobile",
        mobile: { $first: "$customer.mobile" },
        name: { $first: "$customer.name" },
        email: { $first: "$customer.email" },
        bookingCount: { $sum: 1 },
        lastBookingAt: { $max: "$createdAt" },
        lastBookingId: { $first: "$bookingid" },
        serviceTypes: { $addToSet: "$serviceType" },
        totalQuotedAmount: { $sum: { $ifNull: ["$pricing.totalAmount", 0] } },
      },
    },
    { $sort: { lastBookingAt: -1 } },
    { $limit: Math.min(Number(query.limit) || 200, 500) },
  ]);
};

const updateBookingStatus = async (bookingid, payload) => {
  const allowed = ["pending", "quote_sent", "confirmed", "in_progress", "completed", "cancelled"];
  if (!allowed.includes(payload.status)) throw new ApiError(400, "Invalid booking status");
  const booking = await Booking.findOne({ bookingid });
  if (!booking) throw new ApiError(404, "Booking not found");
  booking.status = payload.status;
  booking.statusHistory.push({ status: payload.status, note: payload.note, changedby: "Admin" });
  await booking.save();
  await whatsappService.sendBookingStatusUpdate(booking);
  return booking;
};

const updateBookingDetails = async (bookingid, payload) => {
  const booking = await Booking.findOne({ bookingid });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (payload.status) {
    const allowed = ["pending", "quote_sent", "confirmed", "in_progress", "completed", "cancelled"];
    if (!allowed.includes(payload.status)) throw new ApiError(400, "Invalid booking status");
    if (booking.status !== payload.status) {
      booking.status = payload.status;
      booking.statusHistory.push({ status: payload.status, note: payload.note, changedby: "Admin" });
    }
  }
  if (payload.scheduledate !== undefined) booking.scheduledate = payload.scheduledate ? new Date(payload.scheduledate) : undefined;
  if (payload.timeslot !== undefined) booking.timeslot = payload.timeslot || null;
  if (payload.pricing) booking.pricing = normalizeSubmittedPricing(payload.pricing, "admin");
  if (payload.note) {
    booking.quoteSnapshot = {
      ...(booking.quoteSnapshot || {}),
      note: payload.note,
      updatedAt: new Date(),
    };
  }
  await booking.save();
  return booking;
};

const updateAdminQuote = async (bookingid, payload) => {
  const booking = await Booking.findOne({ bookingid });
  if (!booking) throw new ApiError(404, "Booking not found");
  const quote = buildClientSnapshot(booking, payload.pricing, "admin");
  booking.quoteSnapshot = quote;
  booking.pricing = quote.pricing;
  booking.status = "quote_sent";
  booking.statusHistory.push({ status: "quote_sent", note: payload.note || "Quotation updated", changedby: "Admin" });
  await booking.save();
  return booking;
};

module.exports = {
  createDraft,
  updateDraft,
  previewQuote,
  confirmBooking,
  trackBooking,
  trackBookingsByMobile,
  getAllBookings,
  getBookingById,
  getBookingCustomers,
  updateBookingStatus,
  updateBookingDetails,
  updateAdminQuote,
};
