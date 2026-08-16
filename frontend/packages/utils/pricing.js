const FREE_ALLOWANCES = {};

const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export const normalizeServiceType = (serviceType) => ({
  local: 'local_shifting',
  'local-shifting': 'local_shifting',
  local_shifting: 'local_shifting',
  intercity: 'intercity_moving',
  'intercity-moving': 'intercity_moving',
  intercity_moving: 'intercity_moving',
  labour: 'porter_labour_service',
  'labour-service': 'porter_labour_service',
  porter_labour_service: 'porter_labour_service',
}[serviceType] || serviceType);

export function getDistanceKM(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 1.3 * 10) / 10;
}

function estimateManualDistanceKM(pickupLocation = {}, dropLocation = {}, serviceType) {
  const pickup = pickupLocation || {};
  const drop = dropLocation || {};
  const pickupText = String(pickup.address || '').toLowerCase();
  const dropText = String(drop.address || '').toLowerCase();
  if (!pickupText || !dropText) return 0;
  const isLocal = normalizeServiceType(serviceType) === 'local_shifting';
  const pickupCity = pickupText.includes('surat') ? 'surat' : '';
  const dropCity = dropText.includes('surat') ? 'surat' : '';
  if (isLocal || (pickupCity === 'surat' && dropCity === 'surat')) return 8;
  const knownCityDistance = [
    ['mumbai', 290],
    ['ahmedabad', 265],
    ['vadodara', 155],
    ['baroda', 155],
    ['rajkot', 435],
    ['pune', 415],
    ['delhi', 1150],
  ].find(([city]) => dropText.includes(city));
  return knownCityDistance?.[1] || 50;
}

export function fallbackPricingRule(serviceType = 'local_shifting') {
  const normalized = normalizeServiceType(serviceType);
  const isLabour = normalized === 'porter_labour_service';
  return {
    serviceType: normalized,
    currency: 'INR',
    basePrice: 0,
    freeItemAllowance: [],
    distancePricing: { enabled: !isLabour, slabs: [] },
    floorPricing: { enabled: !isLabour, slabs: [] },
    liftPricing: { enabled: true, withLiftCharge: 0, withoutLiftCharge: 0 },
    labourPricing: { enabled: isLabour, trucks: [], employeeRates: [], hourlyRates: [] },
  };
}

const sortSlabs = (slabs = [], key = 'fromKm') => [...slabs].sort((a, b) => toNumber(a.sortOrder, 999) - toNumber(b.sortOrder, 999) || toNumber(a[key]) - toNumber(b[key]));

export function getDistanceCharges(distance, rule) {
  const km = toNumber(distance);
  if (!km || (rule && !rule?.distancePricing?.enabled)) return 0;
  const slabs = sortSlabs(rule?.distancePricing?.slabs || []);
  return Math.round(slabs.reduce((sum, slab) => {
    const from = toNumber(slab.fromKm);
    const to = slab.toKm === null || slab.toKm === undefined || slab.toKm === '' ? km : toNumber(slab.toKm);
    const slabKm = Math.max(0, Math.min(km, to) - from);
    return sum + slabKm * (slab.isFree ? 0 : toNumber(slab.ratePerKm));
  }, 0));
}

export function getSingleFloorCharge(floorNum, hasLift, rule) {
  const floor = toNumber(floorNum);
  if (floor <= 0 || (rule && !rule?.floorPricing?.enabled)) return 0;
  const slabs = sortSlabs(rule?.floorPricing?.slabs || [], 'fromFloor');
  const slab = slabs.find((item) => floor >= toNumber(item.fromFloor) && (item.toFloor === null || item.toFloor === undefined || item.toFloor === '' || floor <= toNumber(item.toFloor)));
  if (!slab || slab.isFree) return 0;
  const legacyCharge = toNumber(slab.charge);
  const liftEnabled = rule?.liftPricing?.enabled !== false;
  if (liftEnabled && hasLift) return toNumber(slab.withLiftCharge, legacyCharge);
  return toNumber(slab.withoutLiftCharge, legacyCharge);
}

export function calculateItemsPrice(selectedItems = [], rule) {
  return calculateItemsBreakdown(selectedItems, rule).charge;
}

export function calculateItemsBreakdown(selectedItems = [], rule) {
  const allowances = (rule?.freeItemAllowance || []).reduce((acc, item) => ({ ...acc, [String(item.sizeKey || '').toUpperCase()]: toNumber(item.quantity) }), { ...FREE_ALLOWANCES });
  const groupedPrices = {};
  selectedItems.forEach((item) => {
    const tag = String(item.sizeKey || item.tag || item.sizeTag || 'S').toUpperCase();
    groupedPrices[tag] ||= [];
    for (let index = 0; index < toNumber(item.quantity); index += 1) groupedPrices[tag].push(toNumber(item.unitPrice ?? item.price));
  });
  const bySize = Object.entries(groupedPrices).map(([tag, prices]) => {
    const allowance = allowances[tag] ?? 0;
    const sortedPrices = prices.sort((a, b) => b - a);
    const includedPrices = sortedPrices.slice(0, allowance);
    const chargedPrices = sortedPrices.slice(allowance);
    return {
      sizeKey: tag,
      selected: prices.length,
      included: includedPrices.length,
      charged: chargedPrices.length,
      allowance,
      charge: chargedPrices.reduce((inner, price) => inner + price, 0),
    };
  });
  return {
    allowances,
    bySize,
    selectedCount: bySize.reduce((sum, item) => sum + item.selected, 0),
    includedCount: bySize.reduce((sum, item) => sum + item.included, 0),
    chargedCount: bySize.reduce((sum, item) => sum + item.charged, 0),
    charge: bySize.reduce((sum, item) => sum + item.charge, 0),
  };
}

export function calculateBookingPrice(bookingData = {}) {
  const serviceType = normalizeServiceType(bookingData.serviceType);
  const rule = bookingData.pricingRule || fallbackPricingRule(serviceType);
  const isLabour = serviceType === 'porter_labour_service';
  const useBasePackage = Boolean(bookingData.useBasePackage);
  const pickupLocation = bookingData.pickupLocation || {};
  const dropLocation = bookingData.dropLocation || {};
  const distance = bookingData.distance || bookingData.distanceKm || (
    pickupLocation?.lat && pickupLocation?.lng && dropLocation?.lat && dropLocation?.lng
      ? getDistanceKM(pickupLocation.lat, pickupLocation.lng, dropLocation.lat, dropLocation.lng)
      : estimateManualDistanceKM(pickupLocation, dropLocation, serviceType)
  );
  const basePrice = isLabour ? (useBasePackage ? toNumber(rule.basePrice) : 0) : toNumber(rule.basePrice);
  const itemBreakdown = isLabour ? { allowances: {}, bySize: [], selectedCount: 0, includedCount: 0, chargedCount: 0, charge: 0 } : calculateItemsBreakdown(bookingData.items || [], rule);
  const itemsExtraCharge = itemBreakdown.charge;
  const pickupFloorCharge = isLabour ? 0 : getSingleFloorCharge(pickupLocation.floor, pickupLocation.liftAvailable, rule);
  const dropFloorCharge = isLabour ? 0 : getSingleFloorCharge(dropLocation.floor, dropLocation.liftAvailable, rule);
  const floorTotalCharge = pickupFloorCharge + dropFloorCharge;
  const distanceCharge = isLabour && useBasePackage
    ? 0
    : rule?.distancePricing?.enabled
      ? getDistanceCharges(distance, rule)
      : 0;
  const labourPricing = rule.labourPricing || {};
  const selectedHours = toNumber(bookingData.hoursCount || bookingData.hours, 0);
  const selectedEmployees = Math.max(1, toNumber(bookingData.employeeCount, 1));
  const selectedTruckKey = String(bookingData.selectedTruck || bookingData.truckType || '');
  const hourlyRate = (labourPricing.hourlyRates || []).find((item) => toNumber(item.hours) === selectedHours);
  const hourlyPrice = toNumber(hourlyRate?.price ?? bookingData.hourlyRatePerEmployee);
  const employeeRate = (labourPricing.employeeRates || []).find((item) => toNumber(item.employees) === selectedEmployees);
  const selectedTruckData = bookingData.selectedTruckData || {};
  const truck = (labourPricing.trucks || []).find((item) => {
    const values = [item.key, item.id, item._id, item.name].filter(Boolean).map(String);
    return values.includes(selectedTruckKey);
  }) || (selectedTruckData.id || selectedTruckData.name ? selectedTruckData : null);
  const employeeTotal = isLabour && !useBasePackage ? hourlyPrice * selectedEmployees : 0;
  const truckTotal = isLabour && !useBasePackage ? toNumber(truck?.price ?? selectedTruckData.price) : 0;
  const addOnTotal = isLabour ? 0 : (bookingData.specialServices || []).reduce((sum, service) => sum + toNumber(service.total ?? ((service.charge || service.price || service.unitPrice) * (service.quantity || 1))), 0);
  const subtotal = basePrice + itemsExtraCharge + floorTotalCharge + distanceCharge + employeeTotal + truckTotal + addOnTotal;
  const dateValue = bookingData.scheduledDate || bookingData.scheduledate;
  const sundayHike = dateValue && new Date(`${dateValue}T00:00:00`).getDay() === 0 ? Math.round(subtotal * 0.05) : 0;
  const grandTotal = subtotal + sundayHike;
  return {
    basePrice,
    itemsExtraCharge,
    distance,
    distanceCharge,
    pickupFloorCharge,
    dropFloorCharge,
    floorTotalCharge,
    employeeTotal,
    truckTotal,
    addOnTotal,
    sundayHike,
    grandTotal,
    breakdown: {
      distanceKm: distance,
      freeItemAllowance: rule.freeItemAllowance || [],
      itemBreakdown,
      selectedTruck: truck || null,
      employeeRate: employeeRate || null,
      hourlyRate: hourlyRate || null,
      distanceSlabs: rule.distancePricing?.slabs || [],
      floorSlabs: rule.floorPricing?.slabs || [],
    },
  };
}
