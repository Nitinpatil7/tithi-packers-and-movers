const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Booking = require("../schema/Booking.model");
const Item = require("../schema/Item.model");
const AddOnService = require("../schema/Addonservice.model");
const BookingPricingRule = require("../schema/BookingPricingRule.model");
const Otp = require("../schema/Otp.model");
const ApiError = require("../utility/apierror");
const logger = require("../utility/logger");
const { notifyAdminBookingEvent } = require("../utility/bookingEvents");
const inAppNotificationService = require("./inAppNotification.service");
const notificationService = require("./notification.service");
const { normalizeMobile } = require("./otp.service");
const { buildStatusMessage } = require("./whatsappTemplate.service");
const { uploadCompletionProof } = require("./iconUpload.service");
const { isItemCatalogService } = require("../constants/serviceTypes");

const FINAL_STATUSES = ["completed", "cancelled"];
const MANUAL_STATUS_VALUES = ["pending", "quote_sent", "confirmed", "in_progress", "cancelled"];
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

const normalizeId = (value) => String(value?._id || value?.id || value || "");
const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const searchableDigits = (value = "") => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
};
const sizeCandidatesForItem = (item = {}) => {
  const keyParts = [item.itemkey, item.itemKey, item.key]
    .map((value) => String(value || "").split(":").pop())
    .filter(Boolean);
  return [
    item.sizeVariantId,
    item.options?.sizeVariantId,
    item.sizeId,
    item.options?.sizeId,
    item.sizeTag,
    item.tag,
    item.sizeKey,
    ...keyParts,
  ].map((value) => normalizeId(value).toLowerCase()).filter(Boolean);
};
const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const calculateItemBreakdown = (items = [], rule = {}) => {
  const allowance = Object.fromEntries((rule.freeItemAllowance || []).map((entry) => [String(entry.sizeKey || "").toUpperCase(), Math.max(0, toNumber(entry.quantity))]));
  const groupedPrices = {};
  items.forEach((item) => {
    const sizeKey = String(item.sizeTag || "").toUpperCase();
    if (!groupedPrices[sizeKey]) groupedPrices[sizeKey] = [];
    for (let index = 0; index < Math.max(0, toNumber(item.quantity)); index += 1) groupedPrices[sizeKey].push(toNumber(item.unitPrice));
  });
  const bySize = Object.entries(groupedPrices).map(([sizeKey, prices]) => {
    const sorted = prices.sort((a, b) => b - a);
    const freeCount = Math.min(sorted.length, allowance[sizeKey] || 0);
    const charged = sorted.slice(freeCount);
    return {
      sizeKey,
      selected: sorted.length,
      included: freeCount,
      charged: charged.length,
      charge: charged.reduce((sum, price) => sum + price, 0),
    };
  });
  return {
    allowances: allowance,
    bySize,
    selectedCount: items.reduce((sum, item) => sum + Math.max(0, toNumber(item.quantity)), 0),
    includedCount: bySize.reduce((sum, item) => sum + item.included, 0),
    chargedCount: bySize.reduce((sum, item) => sum + item.charged, 0),
    charge: bySize.reduce((sum, item) => sum + item.charge, 0),
  };
};

const addonLineTotal = (addon, baseAmount = 0) => {
  const unit = String(addon.unit || "global").toLowerCase();
  const price = toNumber(addon.pricesnapshot);
  const quantity = Math.max(1, toNumber(addon.quantity, 1));
  if (unit === "percentage") return Math.round(Math.max(0, toNumber(baseAmount)) * price / 100);
  if (["global", "flat"].includes(unit)) return price;
  return price * quantity;
};

const rebuildItemSnapshots = async (submittedItems = []) => {
  const requested = (submittedItems || [])
    .map((item) => ({ ...item, itemId: normalizeId(item.itemId || item._id), sizeCandidates: sizeCandidatesForItem(item), quantity: Math.max(1, toNumber(item.quantity, 1)) }))
    .filter((item) => item.itemId && item.sizeCandidates.length);
  const catalog = await Item.find({ _id: { $in: requested.map((item) => item.itemId) }, isActive: true }).lean();
  const catalogById = new Map(catalog.map((item) => [String(item._id), item]));
  return requested.map((request) => {
    const item = catalogById.get(request.itemId);
    if (!item) throw new ApiError(400, "One or more selected items are invalid or inactive");
    const variant = (item.sizes || []).find((size) => (
      [size._id, size.sizeId, size.sizeKey, size.label]
        .some((value) => request.sizeCandidates.includes(normalizeId(value).toLowerCase()))
    ));
    if (!variant || variant.isActive === false) throw new ApiError(400, `Selected size is invalid for ${item.name}`);
    const unitPrice = toNumber(variant.price);
    return {
      itemId: item._id,
      itemkey: `${item._id}:${variant._id}`,
      category: item.section,
      name: item.name,
      sizeTag: variant.sizeKey || variant.label,
      quantity: request.quantity,
      unitPrice,
      lineTotal: unitPrice * request.quantity,
      options: { sizeVariantId: variant._id, groupId: item.groupId },
    };
  });
};

const rebuildAddonSnapshots = async (submittedAddons = [], baseAmount = 0) => {
  const requested = (submittedAddons || []).map((addon) => ({ ...addon, addonid: normalizeId(addon.addonid || addon.addonId || addon._id) })).filter((addon) => addon.addonid || addon.key || addon.name);
  if (!requested.length) return [];
  const addonIds = requested.map((addon) => addon.addonid).filter(Boolean);
  const addonKeys = requested.map((addon) => addon.key).filter(Boolean);
  const addonNames = requested.map((addon) => addon.name).filter(Boolean);
  const catalog = await AddOnService.find({
    isActive: true,
    $or: [
      ...(addonIds.length ? [{ _id: { $in: addonIds } }] : []),
      ...(addonKeys.length ? [{ key: { $in: addonKeys } }] : []),
      ...(addonNames.length ? [{ name: { $in: addonNames } }] : []),
    ],
  }).lean();
  const byId = new Map(catalog.map((addon) => [String(addon._id), addon]));
  const byKey = new Map(catalog.map((addon) => [String(addon.key), addon]));
  const byName = new Map(catalog.map((addon) => [String(addon.name), addon]));
  return requested.map((request) => {
    const addon = byId.get(request.addonid) || byKey.get(String(request.key)) || byName.get(String(request.name));
    if (!addon) throw new ApiError(400, "One or more selected add-ons are invalid or inactive");
    const snapshot = {
      addonid: addon._id,
      key: addon.key,
      name: addon.name,
      unit: String(addon.unit || "global").toLowerCase(),
      icon: addon.icon || "",
      quantity: Math.max(1, toNumber(request.quantity, 1)),
      pricesnapshot: toNumber(addon.price),
    };
    snapshot.total = addonLineTotal(snapshot, baseAmount);
    return snapshot;
  });
};

const recomputeBookingPricing = async (booking, submittedItems, submittedAddons, calculatedBy = "admin") => {
  if (!isItemCatalogService(booking.serviceType)) {
    return { items: [], selectedAddons: [], pricing: normalizeSubmittedPricing(booking.pricing || { totalAmount: 0 }, calculatedBy) };
  }
  const rule = await BookingPricingRule.findOne({ serviceType: booking.serviceType, isActive: true }).lean();
  const items = await rebuildItemSnapshots(submittedItems);
  const itemBreakdown = calculateItemBreakdown(items, rule || {});
  const previous = booking.pricing || {};
  const previousBreakdown = previous.breakdown || {};
  const basePrice = toNumber(previousBreakdown.basePrice, toNumber(rule?.basePrice));
  const distanceCharge = toNumber(previousBreakdown.distanceCharge);
  const floorTotalCharge = toNumber(previousBreakdown.floorTotalCharge);
  const employeeTotal = toNumber(previousBreakdown.employeeTotal);
  const truckTotal = toNumber(previousBreakdown.truckTotal);
  const serviceCharge = basePrice + distanceCharge + floorTotalCharge + employeeTotal + truckTotal;
  const addOnBaseAmount = serviceCharge + itemBreakdown.charge;
  const selectedAddons = await rebuildAddonSnapshots(submittedAddons, addOnBaseAmount);
  const addOnTotal = selectedAddons.reduce((sum, addon) => sum + toNumber(addon.total), 0);
  const subtotal = serviceCharge + itemBreakdown.charge + addOnTotal;
  const sundayHike = toNumber(previousBreakdown.sundayHike);
  const discount = toNumber(previous.discount);
  const tax = toNumber(previous.tax);
  const pricing = normalizeSubmittedPricing({
    currency: previous.currency || rule?.currency || "INR",
    itemTotal: itemBreakdown.charge,
    addOnTotal,
    serviceCharge,
    discount,
    tax,
    totalAmount: subtotal + sundayHike - discount + tax,
    breakdown: {
      ...previousBreakdown,
      basePrice,
      itemBreakdown,
      itemsExtraCharge: itemBreakdown.charge,
      distanceCharge,
      floorTotalCharge,
      employeeTotal,
      truckTotal,
      addOnBreakdown: selectedAddons.map((addon) => ({
        addonId: addon.addonid,
        key: addon.key,
        name: addon.name,
        unit: addon.unit,
        quantity: addon.quantity,
        unitPrice: addon.pricesnapshot,
        total: addon.total,
      })),
      sundayHike,
    },
  }, calculatedBy);
  return { items, selectedAddons, pricing };
};

const buildClientSnapshot = (booking, pricing, source = "frontend") => ({
  submittedAt: new Date(),
  source,
  pricing: normalizeSubmittedPricing(pricing, source),
  items: booking.items.map((item) => item.toObject ? item.toObject() : item),
  selectedAddons: booking.selectedAddons.map((item) => item.toObject ? item.toObject() : item),
});

const enqueueStatusNotification = async (booking) => {
  if (!booking?.customer?.mobile || process.env.WHATSAPP_STATUS_NOTIFICATIONS === "false") return null;
  try {
    const providerPayload = await buildStatusMessage(booking);
    return await notificationService.sendSingleNotification({
        bookingId: booking._id,
        customerMobile: booking.customer.mobile,
        customerName: booking.customer.name,
        channel: "whatsapp",
        type: booking.status === "completed" ? "booking_completed" : "status_update",
        title: providerPayload.title || "Booking status updated",
        message: providerPayload.message,
      createdBy: "system",
      providerPayload,
      meta: {
        event: "booking_status_updated",
        bookingid: booking.bookingid,
        status: booking.status,
      },
    });
  } catch (error) {
    logger.error("Booking status WhatsApp notification failed to queue", {
      bookingid: booking.bookingid,
      status: booking.status,
      error: error.message,
    });
    return null;
  }
};

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
  notifyAdminBookingEvent("booking:new", {
    bookingid: booking.bookingid,
    status: booking.status,
    customerName: booking.customer.name,
    mobile: booking.customer.mobile,
    scheduledate: booking.scheduledate,
  });
  const result = booking.toObject();
  delete result.draftTokenHash;
  return result;
};

const trackBooking = async (bookingid, mobileInput) => {
  const filter = { bookingid, status: { $ne: "draft" } };
  if (mobileInput) filter["customer.mobile"] = normalizeMobile(mobileInput);
  const booking = await Booking.findOne(filter).select(
    "bookingid customer serviceType status currentStep scheduledate timeslot pickuplocation droplocation distanceKm items selectedAddons porterLabourDetails pricing quoteSnapshot statusHistory confirmedAt createdAt",
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

const getBookingsByPhone = async (mobileInput) => {
  const mobile = normalizeMobile(mobileInput);
  return Booking.find({ "customer.mobile": mobile, status: { $ne: "draft" } })
    .select("bookingid customer serviceType status scheduledate timeslot pricing.totalAmount quoteSnapshot confirmedAt createdAt")
    .sort({ createdAt: -1 })
    .lean();
};

const getAllBookings = async (query = {}) => {
  const filter = { status: { $ne: "draft" } };
  if (query.status && query.status !== "all" && query.status !== "draft") filter.status = query.status;
  if (query.actionOnly === "true") filter.status = { $in: ["pending", "quote_sent", "confirmed", "in_progress"] };
  if (query.delayOnly === "true") {
    const todayStart = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) + "T00:00:00+05:30");
    filter.status = { $in: ["pending", "quote_sent", "confirmed", "in_progress"] };
    filter.scheduledate = { $lt: todayStart };
  }
  if (query.serviceType && query.serviceType !== "all") filter.serviceType = query.serviceType;
  if (query.mobile) filter["customer.mobile"] = normalizeMobile(query.mobile);
  const search = String(query.search || "").trim();
  if (search) {
    const escapedSearch = escapeRegex(search);
    const digits = searchableDigits(search);
    filter.$or = [
      { bookingid: { $regex: escapedSearch, $options: "i" } },
      ...(/^[a-f\d]{24}$/i.test(search) ? [{ _id: search }] : []),
      { "customer.name": { $regex: escapedSearch, $options: "i" } },
      { "customer.email": { $regex: escapedSearch, $options: "i" } },
      { "pickuplocation.city": { $regex: escapedSearch, $options: "i" } },
      { "pickuplocation.address": { $regex: escapedSearch, $options: "i" } },
      { "droplocation.city": { $regex: escapedSearch, $options: "i" } },
      { "droplocation.address": { $regex: escapedSearch, $options: "i" } },
      ...(digits ? [{ "customer.mobile": { $regex: escapeRegex(digits), $options: "i" } }] : []),
    ];
  }
  if (query.scheduledDate && query.delayOnly !== "true") {
    const dayStart = new Date(`${query.scheduledDate}T00:00:00+05:30`);
    if (!Number.isNaN(dayStart.getTime())) {
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      filter.scheduledate = { $gte: dayStart, $lt: dayEnd };
    }
  }
  if (query.createdDate) {
    const dayStart = new Date(`${query.createdDate}T00:00:00+05:30`);
    if (!Number.isNaN(dayStart.getTime())) {
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: dayStart, $lt: dayEnd };
    }
  }
  if (query.upcomingMinutes) {
    const minutes = Math.min(Math.max(Number(query.upcomingMinutes) || 60, 1), 1440);
    const now = new Date();
    filter.status = { $nin: ["draft", "completed", "cancelled"] };
    filter.scheduledate = { $gte: now, $lte: new Date(now.getTime() + minutes * 60 * 1000) };
  }
  const sort = query.scheduledDate || query.delayOnly === "true" || query.upcomingMinutes ? { scheduledate: 1, timeslot: 1, createdAt: -1 } : { createdAt: -1 };
  return Booking.find(filter).sort(sort).limit(Math.min(Number(query.limit) || 100, 200));
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
    const escapedSearch = escapeRegex(search);
    const digits = searchableDigits(search);
    match.$or = [
      { bookingid: { $regex: escapedSearch, $options: "i" } },
      { "customer.name": { $regex: escapedSearch, $options: "i" } },
      { "customer.email": { $regex: escapedSearch, $options: "i" } },
      ...(digits ? [{ "customer.mobile": { $regex: escapeRegex(digits), $options: "i" } }] : []),
    ];
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
  if (!MANUAL_STATUS_VALUES.includes(payload.status)) throw new ApiError(400, "Completed status requires completion proof upload");
  const booking = await Booking.findOne({ bookingid });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (FINAL_STATUSES.includes(booking.status)) throw new ApiError(409, "Finalized bookings cannot be changed");
  booking.status = payload.status;
  booking.statusHistory.push({ status: payload.status, note: payload.note, changedby: "Admin" });
  await booking.save();
  await enqueueStatusNotification(booking);
  notifyAdminBookingEvent("booking:status", {
    bookingid: booking.bookingid,
    status: booking.status,
    customerName: booking.customer?.name,
    mobile: booking.customer?.mobile,
  });
  return booking;
};

const updateBookingDetails = async (bookingid, payload) => {
  const booking = await Booking.findOne({ bookingid });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (FINAL_STATUSES.includes(booking.status) && payload.status && payload.status !== booking.status) throw new ApiError(409, "Finalized bookings cannot be changed");
  let statusChanged = false;
  if (payload.status) {
    if (!MANUAL_STATUS_VALUES.includes(payload.status)) throw new ApiError(400, "Completed status requires completion proof upload");
    if (booking.status !== payload.status) {
      booking.status = payload.status;
      booking.statusHistory.push({ status: payload.status, note: payload.note, changedby: "Admin" });
      statusChanged = true;
    }
  }
  if (payload.scheduledate !== undefined) booking.scheduledate = payload.scheduledate ? new Date(payload.scheduledate) : undefined;
  if (payload.timeslot !== undefined) booking.timeslot = payload.timeslot || null;
  if (payload.items !== undefined || payload.selectedAddons !== undefined) {
    const recomputed = await recomputeBookingPricing(
      booking,
      payload.items !== undefined ? payload.items : booking.items,
      payload.selectedAddons !== undefined ? payload.selectedAddons : booking.selectedAddons,
      "admin",
    );
    booking.items = recomputed.items;
    booking.selectedAddons = recomputed.selectedAddons;
    booking.pricing = recomputed.pricing;
    booking.quoteSnapshot = buildClientSnapshot(booking, recomputed.pricing, "admin");
  } else if (payload.pricing) booking.pricing = normalizeSubmittedPricing(payload.pricing, "admin");
  if (payload.note) {
    booking.quoteSnapshot = {
      ...(booking.quoteSnapshot || {}),
      note: payload.note,
      updatedAt: new Date(),
    };
  }
  await booking.save();
  if (statusChanged) await enqueueStatusNotification(booking);
  notifyAdminBookingEvent(statusChanged ? "booking:status" : "booking:updated", {
    bookingid: booking.bookingid,
    status: booking.status,
    customerName: booking.customer?.name,
    mobile: booking.customer?.mobile,
    scheduledate: booking.scheduledate,
  });
  return booking;
};

const updateCustomerBookingItems = async (bookingid, mobileInput, payload) => {
  const booking = await Booking.findOne({ bookingid, status: { $ne: "draft" } });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (normalizeMobile(mobileInput) !== booking.customer?.mobile) throw new ApiError(401, "Mobile number does not match this booking");
  if (FINAL_STATUSES.includes(booking.status)) throw new ApiError(409, "Completed or cancelled bookings cannot be updated");
  if (!isItemCatalogService(booking.serviceType)) throw new ApiError(400, "Item and add-on updates are not available for this service");
  const recomputed = await recomputeBookingPricing(booking, payload.items || [], payload.selectedAddons || [], "frontend");
  booking.items = recomputed.items;
  booking.selectedAddons = recomputed.selectedAddons;
  booking.pricing = recomputed.pricing;
  booking.quoteSnapshot = buildClientSnapshot(booking, recomputed.pricing, "frontend");
  booking.statusHistory.push({ status: booking.status, note: "Customer updated selected items/add-ons", changedby: "Customer" });
  await booking.save();
  notifyAdminBookingEvent("booking:updated", {
    bookingid: booking.bookingid,
    status: booking.status,
    customerName: booking.customer?.name,
    mobile: booking.customer?.mobile,
  });
  return booking;
};

const completeBookingWithProof = async (bookingid, { file, witnessName, adminId } = {}) => {
  const cleanWitness = String(witnessName || "").trim();
  if (!file) throw new ApiError(400, "Completion proof image is required");
  if (!cleanWitness) throw new ApiError(400, "Witness name is required");
  const booking = await Booking.findOne({ bookingid });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (FINAL_STATUSES.includes(booking.status)) throw new ApiError(409, "Finalized bookings cannot be completed again");

  const uploaded = await uploadCompletionProof(file);
  booking.completionProof = {
    imageUrl: uploaded.imageUrl,
    witnessName: cleanWitness,
    uploadedBy: adminId,
    uploadedAt: new Date(),
  };
  booking.status = "completed";
  booking.statusHistory.push({
    status: "completed",
    note: `Completion proof uploaded by witness ${cleanWitness}`,
    changedby: "Admin",
  });
  await booking.save();
  await enqueueStatusNotification(booking);
  notifyAdminBookingEvent("booking:status", {
    bookingid: booking.bookingid,
    status: booking.status,
    customerName: booking.customer?.name,
    mobile: booking.customer?.mobile,
    completionProof: booking.completionProof,
  });
  return booking;
};

const updateAdminQuote = async (bookingid, payload) => {
  const booking = await Booking.findOne({ bookingid });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (FINAL_STATUSES.includes(booking.status)) throw new ApiError(409, "Finalized bookings cannot be changed");
  const quote = buildClientSnapshot(booking, payload.pricing, "admin");
  booking.quoteSnapshot = quote;
  booking.pricing = quote.pricing;
  booking.status = "quote_sent";
  booking.statusHistory.push({ status: "quote_sent", note: payload.note || "Quotation updated", changedby: "Admin" });
  await booking.save();
  notifyAdminBookingEvent("booking:quote", {
    bookingid: booking.bookingid,
    status: booking.status,
    customerName: booking.customer?.name,
    mobile: booking.customer?.mobile,
  });
  return booking;
};

const getRealtimeSummary = async () => {
  const now = new Date();
  const todayStart = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) + "T00:00:00+05:30");
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  const activeStatuses = ["pending", "quote_sent", "confirmed", "in_progress"];

  const [todayBookings, nextHourBookings, activeBookings] = await Promise.all([
    Booking.find({
      status: { $in: activeStatuses },
      scheduledate: { $gte: todayStart, $lt: todayEnd },
    }).select("bookingid status customer scheduledate timeslot pickuplocation droplocation serviceType").lean(),
    Booking.find({
      status: { $in: activeStatuses },
      scheduledate: { $gte: now, $lte: nextHour },
    }).select("bookingid status customer scheduledate timeslot pickuplocation droplocation serviceType").lean(),
    Booking.find({ status: { $in: activeStatuses } })
      .select("bookingid status customer scheduledate timeslot pickuplocation droplocation serviceType")
      .sort({ scheduledate: 1, createdAt: -1 })
      .limit(50)
      .lean(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    counts: {
      today: todayBookings.length,
      nextHour: nextHourBookings.length,
      active: activeBookings.length,
    },
    todayBookings,
    nextHourBookings,
    activeBookings,
  };
};

module.exports = {
  createDraft,
  updateDraft,
  previewQuote,
  confirmBooking,
  trackBooking,
  trackBookingsByMobile,
  getBookingsByPhone,
  getAllBookings,
  getBookingById,
  getBookingCustomers,
  updateBookingStatus,
  updateBookingDetails,
  updateCustomerBookingItems,
  completeBookingWithProof,
  updateAdminQuote,
  getRealtimeSummary,
};
