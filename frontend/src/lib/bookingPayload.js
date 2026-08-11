import { calculateBookingPrice, normalizeServiceType } from '@/lib/pricing';

const isCoordinateAddress = (value = '') => /^-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+$/.test(String(value).trim());
const readableAddress = (location = {}) => {
  const address = String(location.address || '').trim();
  if (address && !isCoordinateAddress(address)) return address;
  const fallback = String(location.mapAddress || location.formattedAddress || '').trim();
  return fallback && !isCoordinateAddress(fallback) ? fallback : '';
};

const inferLocationFallbacks = (location = {}) => {
  const address = readableAddress(location);
  const isSurat = /\bsurat\b/i.test(address) || String(location.city || '').toLowerCase() === 'surat';
  const pincodeFromAddress = address.match(/\b\d{6}\b/)?.[0];
  return {
    city: location.city || (isSurat ? 'Surat' : 'Unknown'),
    state: location.state || (isSurat || /gujarat/i.test(address) ? 'Gujarat' : 'India'),
    pincode: location.pincode || pincodeFromAddress || (isSurat ? '395001' : '000000'),
  };
};

const cleanLocation = (location = {}) => {
  const fallback = inferLocationFallbacks(location);
  return {
    address: readableAddress(location),
    city: fallback.city,
    state: fallback.state,
    pincode: fallback.pincode,
    floor: Number(location.floor || 0),
    liftavailable: Boolean(location.liftAvailable ?? location.liftavailable),
    coordination: {
      lat: location.lat === null || location.lat === undefined ? undefined : Number(location.lat),
      lng: location.lng === null || location.lng === undefined ? undefined : Number(location.lng),
    },
  };
};

const buildPorterLabourDetails = (bookingData = {}) => {
  if (normalizeServiceType(bookingData.serviceType) !== 'porter_labour_service') return undefined;
  const truckType = bookingData.truckType || bookingData.selectedTruck || 'mini_truck';
  const employeeCount = Number(bookingData.employeeCount || 1);
  const hours = Number(bookingData.hoursCount || bookingData.hours || 1);
  return {
    truckType,
    employeeCount: Math.max(1, employeeCount),
    hours: Math.min(7, Math.max(1, hours)),
  };
};

export const buildDraftCreatePayload = (bookingData = {}) => {
  const pricing = calculateBookingPrice(bookingData);
  const porterLabourDetails = buildPorterLabourDetails(bookingData);
  return {
    serviceType: normalizeServiceType(bookingData.serviceType),
    pickuplocation: cleanLocation(bookingData.pickupLocation),
    droplocation: cleanLocation(bookingData.dropLocation),
    distanceKm: Number(pricing.distance || 0),
    scheduledate: bookingData.scheduledDate ? new Date(`${bookingData.scheduledDate}T09:00:00.000Z`).toISOString() : undefined,
    timeslot: bookingData.timeSlot || undefined,
    ...(porterLabourDetails ? { porterLabourDetails } : {}),
  };
};

export const buildDraftUpdatePayload = (bookingData = {}) => {
  const pricing = calculateBookingPrice(bookingData);
  const porterLabourDetails = buildPorterLabourDetails(bookingData);
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
