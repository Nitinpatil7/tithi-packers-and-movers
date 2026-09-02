// src/lib/api.js
import { authFetch } from './authFetch';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

const readResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || 'Request failed.');
  return payload.data ?? payload;
};

const asArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};

const queryString = (filters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') query.set(key, String(value));
  });
  return query.toString();
};

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const isCoordinateAddress = (value = '') => /^-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+$/.test(String(value).trim());
const normalizeLocation = (location = {}) => {
  const address = String(location.address || '').trim();
  const fallback = String(location.mapAddress || location.formattedAddress || '').trim();
  return {
    ...location,
    address: address && !isCoordinateAddress(address)
      ? address
      : fallback && !isCoordinateAddress(fallback)
        ? fallback
        : '',
    liftAvailable: location.liftAvailable ?? location.liftavailable,
  };
};

export const normalizeBooking = (booking = {}) => {
  const customer = booking.customer || {};
  const snapshot = booking.quoteSnapshot || {};
  const pricing = booking.pricing || snapshot.pricing || {};
  const pickupLocation = booking.pickupLocation || booking.pickuplocation || {};
  const dropLocation = booking.dropLocation || booking.droplocation || {};
  const porterLabourDetails = booking.porterLabourDetails || {};
  const breakdown = pricing.breakdown || {};
  const bookingId = booking.bookingId || booking.bookingid || booking._id || '';
  const items = Array.isArray(booking.items) && booking.items.length ? booking.items : snapshot.items || [];
  const selectedAddons = Array.isArray(booking.selectedAddons) && booking.selectedAddons.length ? booking.selectedAddons : snapshot.selectedAddons || [];
  return {
    ...booking,
    bookingId,
    bookingid: booking.bookingid || bookingId,
    customerName: booking.customerName || customer.name || '',
    mobile: booking.mobile || customer.mobile || '',
    email: booking.email || customer.email || '',
    pickupLocation: normalizeLocation(pickupLocation),
    dropLocation: normalizeLocation(dropLocation),
    scheduledDate: booking.scheduledDate || toDateInput(booking.scheduledate),
    timeSlot: booking.timeSlot || booking.timeslot || '',
    truckType: booking.truckType || porterLabourDetails.truckType || '',
    employeeCount: booking.employeeCount || porterLabourDetails.employeeCount || 0,
    hoursCount: booking.hoursCount || porterLabourDetails.hours || 0,
    distanceKm: Number(booking.distanceKm ?? breakdown.distanceKm ?? 0),
    employeeTotal: Number(booking.employeeTotal ?? breakdown.employeeTotal ?? 0),
    truckTotal: Number(booking.truckTotal ?? breakdown.truckTotal ?? 0),
    manualQuote: Number(booking.manualQuote ?? pricing.serviceCharge ?? 0),
    addOnTotal: Number(booking.addOnTotal ?? pricing.addOnTotal ?? 0),
    itemTotal: Number(booking.itemTotal ?? pricing.itemTotal ?? 0),
    totalAmount: Number(booking.totalAmount ?? pricing.totalAmount ?? 0),
    distanceCharge: Number(booking.distanceCharge ?? breakdown.distanceCharge ?? 0),
    floorTotalCharge: Number(booking.floorTotalCharge ?? breakdown.floorTotalCharge ?? 0),
    itemsExtraCharge: Number(booking.itemsExtraCharge ?? breakdown.itemsExtraCharge ?? pricing.itemTotal ?? 0),
    selectedAddons,
    items,
    completionProof: booking.completionProof || null,
    pricingBreakdown: breakdown,
    pricing,
  };
};

export const checkMobile = async (mobile) => authFetch(`${API_URL}/api/otp/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mobile, purpose: 'booking' }),
}).then(readResponse).then((data) => ({ success: true, data }));

export const verifyOTP = async (mobile, otp) => authFetch(`${API_URL}/api/otp/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mobile, otp, purpose: 'booking' }),
}).then(readResponse).then((data) => ({ success: true, data, verificationId: data?.verificationId }));

export const registerUser = async () => {
  throw new Error('User registration API is not mounted in the current backend.');
};

export const createBooking = async () => {
  throw new Error('Use the booking draft APIs: /api/bookings/draft, /api/bookings/:bookingId/draft, and /api/bookings/:bookingId/confirm.');
};

export const getMyBookings = async (mobile) => authFetch(`${API_URL}/api/bookings/track?mobile=${encodeURIComponent(mobile)}`, { cache: 'no-store' })
  .then(readResponse)
  .then((payload) => asArray(payload, ['bookings', 'items', 'results']).map(normalizeBooking));

export const getBookingById = async (id, token, mobile) => {
  if (mobile) return authFetch(`${API_URL}/api/bookings/track/${encodeURIComponent(id)}?mobile=${encodeURIComponent(mobile)}`, { cache: 'no-store' }).then(readResponse).then(normalizeBooking);
  if (!token) return authFetch(`${API_URL}/api/bookings/track/${encodeURIComponent(id)}`, { cache: 'no-store' }).then(readResponse).then(normalizeBooking);
  return authFetch(`${API_URL}/api/bookings/admin/${encodeURIComponent(id)}`, { credentials: 'include' }).then(readResponse).then(normalizeBooking);
};

export const getAdminStats = async () => authFetch(`${API_URL}/api/admin-analytics/dashboard`, { credentials: 'include' })
  .then(readResponse)
  .then((payload) => {
    const stats = payload?.stats || {};
    const serviceKeyMap = {
      local_shifting: 'local',
      intercity_moving: 'intercity',
      porter_labour_service: 'porterLabour',
    };
    const bookingsByService = {};
    (payload?.serviceBreakdown || []).forEach((item) => {
      if (!item.serviceType) return;
      const count = Number(item.bookings || 0);
      bookingsByService[item.serviceType] = count;
      bookingsByService[serviceKeyMap[item.serviceType] || item.serviceType] = count;
    });
    return {
      ...payload,
      ...stats,
      todayBookings: stats.todayBookings || 0,
      pendingBookings: stats.pendingBookings || 0,
      confirmedBookings: stats.inProgressBookings || 0,
      completedThisMonth: stats.completedBookings || 0,
      dailyBookings: (payload?.dailyBookingGraph || []).map((item) => ({
        ...item,
        count: Number(item.count ?? item.bookings ?? 0),
      })),
      bookingsByService,
      recentBookings: (payload?.recentBookings || []).map(normalizeBooking),
    };
  });
export const getAdminAnalyticsOverview = async () => authFetch(`${API_URL}/api/admin-analytics/overview`, { credentials: 'include' }).then(readResponse);

export const getAllBookings = async (filters = {}) => {
  const query = queryString(filters);
  return authFetch(`${API_URL}/api/bookings/admin/all${query ? `?${query}` : ''}`, { credentials: 'include' })
    .then(readResponse)
    .then((payload) => {
      const bookings = asArray(payload, ['bookings', 'items', 'results'])
        .filter((booking) => booking.status !== 'draft')
        .map(normalizeBooking);
      return { bookings, total: payload?.total ?? payload?.count ?? bookings.length };
    });
};

export const getBookingsByPhone = async (phoneNumber) => authFetch(`${API_URL}/api/admin/bookings/by-phone/${encodeURIComponent(phoneNumber)}`, { credentials: 'include' })
  .then(readResponse)
  .then((payload) => asArray(payload, ['bookings', 'items', 'results']).map(normalizeBooking));

export const updateBookingDetails = async (id, data) => authFetch(`${API_URL}/api/bookings/admin/${encodeURIComponent(id)}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(data),
}).then(readResponse).then(normalizeBooking);

export const updateCustomerBookingItems = async (id, data) => authFetch(`${API_URL}/api/bookings/${encodeURIComponent(id)}/update-items`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
}).then(readResponse).then(normalizeBooking);

export const completeBookingWithProof = async (id, { image, witnessName }) => {
  const form = new FormData();
  if (image) form.append('image', image);
  form.append('witnessName', witnessName || '');
  return authFetch(`${API_URL}/api/bookings/admin/${encodeURIComponent(id)}/completion-proof`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  }).then(readResponse).then(normalizeBooking);
};

export const updateBookingStatus = async (id, status, note = '') => authFetch(`${API_URL}/api/bookings/admin/${encodeURIComponent(id)}/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ status, note }),
}).then(readResponse);

export const updateBookingQuote = async (id, data) => authFetch(`${API_URL}/api/bookings/admin/${encodeURIComponent(id)}/quote`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(data),
}).then(readResponse);

export const getPricing = async () => authFetch(`${API_URL}/api/booking-pricing-rules/admin/all`, { credentials: 'include' }).then(readResponse).then((payload) => asArray(payload, ['rules', 'pricing', 'items', 'results']));

export const updatePricingItem = async (id, updateData) => authFetch(`${API_URL}/api/booking-pricing-rules/admin/${encodeURIComponent(id)}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(updateData),
}).then(readResponse);

export const getUsers = async (filters = {}) => {
  const query = queryString(filters);
  return authFetch(`${API_URL}/api/bookings/admin/customers${query ? `?${query}` : ''}`, { credentials: 'include' })
    .then(readResponse)
    .then((payload) => asArray(payload, ['users', 'customers', 'items', 'results']));
};

export const getNotifications = async (filters = {}) => {
  const query = queryString(filters);
  return authFetch(`${API_URL}/api/notification${query ? `?${query}` : ''}`, { credentials: 'include' })
    .then(readResponse)
    .then((payload) => asArray(payload, ['notifications', 'items', 'results']));
};

export const sendNotification = async (data) => authFetch(`${API_URL}/api/notification/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(data),
}).then(readResponse);

export const getNotificationTemplates = async () => authFetch(`${API_URL}/api/notification/templates/admin`, { credentials: 'include' })
  .then(readResponse)
  .then((payload) => asArray(payload, ['templates', 'items', 'results']));

export const updateNotificationTemplate = async (status, data) => authFetch(`${API_URL}/api/notification/templates/admin/${encodeURIComponent(status)}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(data),
}).then(readResponse);

export const getInAppNotifications = async (filters = {}) => {
  const query = queryString(filters);
  return authFetch(`${API_URL}/api/in-app-notifications${query ? `?${query}` : ''}`, { credentials: 'include' })
    .then(readResponse)
    .then((payload) => asArray(payload, ['notifications', 'alerts', 'items', 'results']));
};

export const getInAppNotificationSummary = async () => authFetch(`${API_URL}/api/in-app-notifications/summary`, { credentials: 'include' }).then(readResponse);
export const markInAppNotificationRead = async (id) => authFetch(`${API_URL}/api/in-app-notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH', credentials: 'include' }).then(readResponse);
export const markAllInAppNotificationsRead = async () => authFetch(`${API_URL}/api/in-app-notifications/read-all`, { method: 'PATCH', credentials: 'include' }).then(readResponse);
