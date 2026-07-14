const BookingPricingRule = require("../schema/BookingPricingRule.model");
const ApiError = require("../utility/apierror");
const { service_types, SERVICE_TYPE_VALUES } = require("../constants/serviceTypes");

const SIZE_KEYS = ["XS", "S", "M", "L", "XL", "XXL"];

const DEFAULT_ALLOWANCE = [
  { sizeKey: "XS", quantity: 4 },
  { sizeKey: "S", quantity: 3 },
  { sizeKey: "M", quantity: 1 },
  { sizeKey: "L", quantity: 1 },
  { sizeKey: "XL", quantity: 1 },
  { sizeKey: "XXL", quantity: 1 },
];

const DEFAULT_DISTANCE_SLABS = [
  { label: "0-2 km", fromKm: 0, toKm: 2, ratePerKm: 0, isFree: true, sortOrder: 1 },
  { label: "2-5 km", fromKm: 2, toKm: 5, ratePerKm: 35, isFree: false, sortOrder: 2 },
  { label: "5-30 km", fromKm: 5, toKm: 30, ratePerKm: 22, isFree: false, sortOrder: 3 },
  { label: "30-75 km", fromKm: 30, toKm: 75, ratePerKm: 26, isFree: false, sortOrder: 4 },
  { label: "75+ km", fromKm: 75, toKm: null, ratePerKm: 26, isFree: false, sortOrder: 5 },
];

const DEFAULT_FLOOR_SLABS = [
  { label: "1-2 floor", fromFloor: 1, toFloor: 2, charge: 0, withLiftCharge: 0, withoutLiftCharge: 0, isFree: true, sortOrder: 1 },
  { label: "3-5 floor", fromFloor: 3, toFloor: 5, charge: 170, withLiftCharge: 90, withoutLiftCharge: 170, sortOrder: 2 },
  { label: "6-8 floor", fromFloor: 6, toFloor: 8, charge: 270, withLiftCharge: 140, withoutLiftCharge: 270, sortOrder: 3 },
  { label: "9-11 floor", fromFloor: 9, toFloor: 11, charge: 350, withLiftCharge: 180, withoutLiftCharge: 350, sortOrder: 4 },
  { label: "12+ floor", fromFloor: 12, toFloor: null, charge: 450, withLiftCharge: 240, withoutLiftCharge: 450, sortOrder: 5 },
];

const DEFAULTS_BY_SERVICE = {
  [service_types.LOCAL_SHIFTING]: {
    serviceType: service_types.LOCAL_SHIFTING,
    name: "Local shifting pricing",
    description: "Base, item allowance, distance, floor and lift rules for local shifting bookings.",
    basePrice: 1499,
    freeItemAllowance: DEFAULT_ALLOWANCE,
    distancePricing: { enabled: true, slabs: DEFAULT_DISTANCE_SLABS },
    floorPricing: { enabled: true, slabs: DEFAULT_FLOOR_SLABS },
    liftPricing: { enabled: true, withLiftCharge: 0, withoutLiftCharge: 0 },
    labourPricing: { enabled: false, trucks: [], employeeRates: [], hourlyRates: [] },
  },
  [service_types.INTERCITY_MOVING]: {
    serviceType: service_types.INTERCITY_MOVING,
    name: "Intercity moving pricing",
    description: "Base, item allowance, distance, floor and lift rules for intercity moving bookings.",
    basePrice: 1499,
    freeItemAllowance: DEFAULT_ALLOWANCE,
    distancePricing: { enabled: true, slabs: DEFAULT_DISTANCE_SLABS },
    floorPricing: { enabled: true, slabs: DEFAULT_FLOOR_SLABS },
    liftPricing: { enabled: true, withLiftCharge: 0, withoutLiftCharge: 0 },
    labourPricing: { enabled: false, trucks: [], employeeRates: [], hourlyRates: [] },
  },
  [service_types.PORTER_LABOUR_SERVICE]: {
    serviceType: service_types.PORTER_LABOUR_SERVICE,
    name: "Porter labour pricing",
    description: "Truck and hourly-rate rules for porter labour bookings.",
    basePrice: 0,
    freeItemAllowance: DEFAULT_ALLOWANCE,
    distancePricing: { enabled: false, slabs: [] },
    floorPricing: { enabled: false, slabs: [] },
    liftPricing: { enabled: false, withLiftCharge: 0, withoutLiftCharge: 0 },
    labourPricing: {
      enabled: true,
      trucks: [
        { key: "mini_truck", name: "Mini truck", capacityLabel: "Small load", capacityKg: 500, price: 0, isFree: true, sortOrder: 1 },
        { key: "pickup", name: "Pickup truck", capacityLabel: "Medium load", capacityKg: 900, price: 0, sortOrder: 2 },
      ],
      employeeRates: [
        { employees: 1, label: "1 employee", isFree: true, sortOrder: 1 },
        { employees: 2, label: "2 employees", sortOrder: 2 },
        { employees: 3, label: "3 employees", sortOrder: 3 },
      ],
      hourlyRates: [
        { hours: 1, label: "1 hour", price: 0, isFree: true, sortOrder: 1 },
        { hours: 2, label: "2 hours", price: 0, sortOrder: 2 },
        { hours: 5, label: "5 hours", price: 0, sortOrder: 5 },
      ],
    },
  },
};

const sortByOrder = (items = []) => [...items].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
const slug = (value = "") => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "vehicle";

const normalizeAllowance = (allowance) => {
  if (allowance === undefined) return allowance;
  const bySize = new Map();
  for (const item of allowance || []) {
    const sizeKey = String(item.sizeKey || "").trim().toUpperCase();
    if (!SIZE_KEYS.includes(sizeKey)) throw new ApiError(400, `Invalid sizeKey ${sizeKey}`);
    bySize.set(sizeKey, { sizeKey, quantity: Number(item.quantity) || 0 });
  }
  return SIZE_KEYS.map((sizeKey) => bySize.get(sizeKey) || { sizeKey, quantity: 0 });
};

const normalizeSlabs = (slabs = [], fromKey, toKey) => {
  return sortByOrder(slabs).map((slab, index) => {
    const fromValue = Number(slab[fromKey]);
    const toValue = slab[toKey] === null || slab[toKey] === undefined || slab[toKey] === ""
      ? null
      : Number(slab[toKey]);
    if (Number.isNaN(fromValue) || fromValue < 0) throw new ApiError(400, `${fromKey} must be a positive number`);
    if (toValue !== null && (Number.isNaN(toValue) || toValue < fromValue)) {
      throw new ApiError(400, `${toKey} must be empty or greater than ${fromKey}`);
    }
    return { ...slab, [fromKey]: fromValue, [toKey]: toValue, sortOrder: slab.sortOrder ?? index + 1 };
  });
};

const normalizePayload = (payload = {}) => {
  const normalized = { ...payload };
  if (normalized.serviceType && !SERVICE_TYPE_VALUES.includes(normalized.serviceType)) {
    throw new ApiError(400, "Invalid serviceType");
  }
  if (normalized.freeItemAllowance !== undefined) {
    normalized.freeItemAllowance = normalizeAllowance(normalized.freeItemAllowance);
  }
  if (normalized.distancePricing?.slabs) {
    normalized.distancePricing = {
      ...normalized.distancePricing,
      slabs: normalizeSlabs(normalized.distancePricing.slabs, "fromKm", "toKm"),
    };
  }
  if (normalized.floorPricing?.slabs) {
    normalized.floorPricing = {
      ...normalized.floorPricing,
      slabs: normalizeSlabs(normalized.floorPricing.slabs, "fromFloor", "toFloor").map((slab) => {
        const withoutLiftCharge = Number(slab.withoutLiftCharge ?? slab.charge ?? 0);
        const withLiftCharge = Number(slab.withLiftCharge ?? slab.charge ?? 0);
        return {
          ...slab,
          withoutLiftCharge: slab.isFree ? 0 : withoutLiftCharge,
          withLiftCharge: slab.isFree ? 0 : withLiftCharge,
          charge: slab.isFree ? 0 : withoutLiftCharge,
        };
      }),
    };
  }
  if (normalized.labourPricing?.trucks) {
    normalized.labourPricing.trucks = sortByOrder(normalized.labourPricing.trucks).map((truck) => ({
      ...truck,
      key: slug(truck.key || truck.name),
      capacityKg: Number(truck.capacityKg) || 0,
      price: truck.isFree ? 0 : Number(truck.price) || 0,
      isActive: true,
    }));
  }
  if (normalized.labourPricing?.employeeRates) {
    normalized.labourPricing.employeeRates = sortByOrder(normalized.labourPricing.employeeRates).map((rate) => ({
      ...rate,
      employees: Number(rate.employees) || 1,
      label: rate.label || `${Number(rate.employees) || 1} employee${Number(rate.employees) > 1 ? "s" : ""}`,
      price: 0,
      isActive: true,
    }));
  }
  if (normalized.labourPricing?.hourlyRates) {
    normalized.labourPricing.hourlyRates = sortByOrder(normalized.labourPricing.hourlyRates).map((rate) => ({
      ...rate,
      hours: Number(rate.hours) || 1,
      label: rate.label || `${Number(rate.hours) || 1} hour${Number(rate.hours) > 1 ? "s" : ""}`,
      price: rate.isFree ? 0 : Number(rate.price) || 0,
      isActive: true,
    }));
  }
  return normalized;
};

const mergeRulePayload = (existing, payload) => {
  const current = existing.toObject();
  const merged = { ...payload };
  if (payload.distancePricing) {
    merged.distancePricing = { ...current.distancePricing, ...payload.distancePricing };
  }
  if (payload.floorPricing) {
    merged.floorPricing = { ...current.floorPricing, ...payload.floorPricing };
  }
  if (payload.liftPricing) {
    merged.liftPricing = { ...current.liftPricing, ...payload.liftPricing };
  }
  if (payload.labourPricing) {
    merged.labourPricing = { ...current.labourPricing, ...payload.labourPricing };
  }
  return merged;
};

const getPublicRules = (query = {}) => {
  const filter = { isActive: true };
  if (query.serviceType) filter.serviceType = query.serviceType;
  return BookingPricingRule.find(filter).sort({ sortOrder: 1, serviceType: 1 }).lean();
};

const getPublicRuleByService = async (serviceType) => {
  if (!SERVICE_TYPE_VALUES.includes(serviceType)) throw new ApiError(400, "Invalid serviceType");
  const rule = await BookingPricingRule.findOne({ serviceType, isActive: true }).lean();
  if (!rule) throw new ApiError(404, "Booking pricing rule not found");
  return rule;
};

const getAdminRules = (query = {}) => {
  const filter = {};
  if (query.serviceType) filter.serviceType = query.serviceType;
  if (query.isActive === "true") filter.isActive = true;
  if (query.isActive === "false") filter.isActive = false;
  return BookingPricingRule.find(filter).sort({ sortOrder: 1, serviceType: 1 });
};

const getAdminRuleById = async (id) => {
  const rule = await BookingPricingRule.findById(id);
  if (!rule) throw new ApiError(404, "Booking pricing rule not found");
  return rule;
};

const createRule = async (payload) => {
  const normalized = normalizePayload(payload);
  if (!normalized.serviceType) throw new ApiError(400, "serviceType is required");
  const existing = await BookingPricingRule.findOne({ serviceType: normalized.serviceType });
  if (existing) throw new ApiError(409, "Pricing rule already exists for this serviceType");
  return BookingPricingRule.create({
    ...DEFAULTS_BY_SERVICE[normalized.serviceType],
    ...normalized,
  });
};

const createDefaultRules = async () => {
  const created = [];
  for (const serviceType of SERVICE_TYPE_VALUES) {
    const existing = await BookingPricingRule.findOne({ serviceType });
    if (!existing) {
      created.push(await BookingPricingRule.create(DEFAULTS_BY_SERVICE[serviceType]));
    }
  }
  return created;
};

const updateRule = async (id, payload) => {
  const existing = await BookingPricingRule.findById(id);
  if (!existing) throw new ApiError(404, "Booking pricing rule not found");
  const normalized = normalizePayload(mergeRulePayload(existing, payload));
  if (normalized.serviceType) delete normalized.serviceType;
  Object.assign(existing, normalized);
  return existing.save();
};

const deleteRule = async (id) => {
  const rule = await BookingPricingRule.findByIdAndUpdate(
    id,
    { $set: { isActive: false } },
    { new: true },
  );
  if (!rule) throw new ApiError(404, "Booking pricing rule not found");
  return rule;
};

module.exports = {
  getPublicRules,
  getPublicRuleByService,
  getAdminRules,
  getAdminRuleById,
  createRule,
  createDefaultRules,
  updateRule,
  deleteRule,
};
