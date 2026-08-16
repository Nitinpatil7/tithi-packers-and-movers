import { calculateBookingPrice, normalizeServiceType } from '@utils/pricing';

const isCoordinateAddress = (value = '') => /^-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+$/.test(String(value).trim());
const readableAddress = (location = {}) => {
  const source = location || {};
  const address = String(source.address || '').trim();
  if (address && !isCoordinateAddress(address)) return address;
  const fallback = String(source.mapAddress || source.formattedAddress || '').trim();
  return fallback && !isCoordinateAddress(fallback) ? fallback : '';
};

const inferLocationFallbacks = (location = {}) => {
  const source = location || {};
  const address = readableAddress(source);
  const isSurat = /\bsurat\b/i.test(address) || String(source.city || '').toLowerCase() === 'surat';
  const pincodeFromAddress = address.match(/\b\d{6}\b/)?.[0];
  return {
    city: source.city || (isSurat ? 'Surat' : 'Unknown'),
    state: source.state || (isSurat || /gujarat/i.test(address) ? 'Gujarat' : 'India'),
    pincode: source.pincode || pincodeFromAddress || (isSurat ? '395001' : '000000'),
  };
};

const cleanLocation = (location = {}) => {
  const source = location || {};
  const fallback = inferLocationFallbacks(source);
  const address = readableAddress(source);
  if (!address) return undefined;
  return {
    address,
    city: fallback.city,
    state: fallback.state,
    pincode: fallback.pincode,
    floor: Number(source.floor || 0),
    liftavailable: Boolean(source.liftAvailable ?? source.liftavailable),
    coordination: {
      lat: source.lat === null || source.lat === undefined ? undefined : Number(source.lat),
      lng: source.lng === null || source.lng === undefined ? undefined : Number(source.lng),
    },
  };
};

const buildPorterLabourDetails = (bookingData = {}) => {
  if (normalizeServiceType(bookingData.serviceType) !== 'porter_labour_service') return undefined;
  const truckType = bookingData.labourOnly ? null : bookingData.truckType || bookingData.selectedTruck || null;
  const employeeCount = Number(bookingData.employeeCount || 1);
  const hours = Number(bookingData.hoursCount || bookingData.hours || 1);
  return {
    ...(truckType ? { truckType } : {}),
    employeeCount: Math.max(1, employeeCount),
    hours: Math.min(7, Math.max(1, hours)),
  };
};

export const buildDraftCreatePayload = (bookingData = {}) => {
  const pricing = calculateBookingPrice(bookingData);
  const porterLabourDetails = buildPorterLabourDetails(bookingData);
  const pickupLocation = cleanLocation(bookingData.pickupLocation);
  const dropLocation = cleanLocation(bookingData.dropLocation);
  return {
    serviceType: normalizeServiceType(bookingData.serviceType),
    ...(pickupLocation ? { pickuplocation: pickupLocation } : {}),
    ...(dropLocation ? { droplocation: dropLocation } : {}),
    distanceKm: Number(pricing.distance || 0),
    scheduledate: bookingData.scheduledDate ? new Date(`${bookingData.scheduledDate}T09:00:00.000Z`).toISOString() : undefined,
    timeslot: bookingData.timeSlot || undefined,
    ...(porterLabourDetails ? { porterLabourDetails } : {}),
  };
};

export const buildDraftUpdatePayload = (bookingData = {}) => {
  const pricing = calculateBookingPrice(bookingData);
  const porterLabourDetails = buildPorterLabourDetails(bookingData);
  const serviceType = normalizeServiceType(bookingData.serviceType);
  const pickupLocation = cleanLocation(bookingData.pickupLocation);
  const dropLocation = cleanLocation(bookingData.dropLocation);
  const items = (bookingData.items || []).map((item) => {
    const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
    return {
      itemId: item.itemId,
      itemkey: item.itemkey || item.key,
      category: item.category || item.section,
      name: item.name,
      icon: item.icon || '',
      sizeTag: item.sizeTag || item.tag || item.sizeKey,
      quantity: Number(item.quantity || 0),
      unitPrice,
      lineTotal: unitPrice * Number(item.quantity || 0),
      options: { sizeVariantId: item.sizeVariantId || item.sizeId, groupId: item.groupId },
    };
  });
  const selectedAddons = (bookingData.specialServices || []).map((addon) => ({
    addonid: addon.addonId || addon._id,
    key: addon.key,
    name: addon.name,
    unit: addon.unit,
    quantity: Number(addon.quantity || 1),
    pricesnapshot: Number(addon.unitPrice ?? addon.price ?? addon.charge ?? 0),
    total: Number(addon.total ?? ((addon.unitPrice ?? addon.price ?? addon.charge ?? 0) * (addon.quantity || 1))),
  }));
  return {
    ...(pickupLocation ? { pickuplocation: pickupLocation } : {}),
    ...(dropLocation ? { droplocation: dropLocation } : serviceType === 'porter_labour_service' ? { droplocation: null } : {}),
    distanceKm: Number(pricing.distance || 0),
    items,
    selectedAddons,
    scheduledate: bookingData.scheduledDate ? new Date(`${bookingData.scheduledDate}T09:00:00.000Z`).toISOString() : undefined,
    timeslot: bookingData.timeSlot || undefined,
    ...(porterLabourDetails ? { porterLabourDetails } : {}),
    pricing: {
      currency: bookingData.pricingRule?.currency || 'INR',
      itemTotal: pricing.itemsExtraCharge,
      addOnTotal: pricing.addOnTotal,
      serviceCharge: pricing.basePrice + pricing.distanceCharge + pricing.floorTotalCharge + pricing.employeeTotal + pricing.truckTotal,
      discount: 0,
      tax: 0,
      totalAmount: pricing.grandTotal,
      breakdown: {
        ...pricing.breakdown,
        basePrice: pricing.basePrice,
        distanceCharge: pricing.distanceCharge,
        floorTotalCharge: pricing.floorTotalCharge,
        employeeTotal: pricing.employeeTotal,
        truckTotal: pricing.truckTotal,
        sundayHike: pricing.sundayHike,
      },
    },
  };
};
