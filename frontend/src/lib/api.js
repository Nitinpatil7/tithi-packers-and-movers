// src/lib/api.js
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

export const normalizeBooking = (booking = {}) => {
  const customer = booking.customer || {};
  const pricing = booking.pricing || booking.quoteSnapshot?.pricing || {};
  const pickupLocation = booking.pickupLocation || booking.pickuplocation || {};
  const dropLocation = booking.dropLocation || booking.droplocation || {};
  const porterLabourDetails = booking.porterLabourDetails || {};
  const breakdown = pricing.breakdown || {};
  const bookingId = booking.bookingId || booking.bookingid || booking._id || '';
  return {
    ...booking,
    bookingId,
    bookingid: booking.bookingid || bookingId,
    customerName: booking.customerName || customer.name || '',
    mobile: booking.mobile || customer.mobile || '',
    email: booking.email || customer.email || '',
    pickupLocation: { ...pickupLocation, liftAvailable: pickupLocation.liftAvailable ?? pickupLocation.liftavailable },
    dropLocation: { ...dropLocation, liftAvailable: dropLocation.liftAvailable ?? dropLocation.liftavailable },
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
    pricing,
  };
};

export const checkMobile = async (mobile) => fetch(`${API_URL}/api/otp/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mobile, purpose: 'booking' }),
}).then(readResponse).then((data) => ({ success: true, data }));

export const verifyOTP = async (mobile, otp) => fetch(`${API_URL}/api/otp/verify`, {
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

export const getMyBookings = async (mobile) => fetch(`${API_URL}/api/bookings/track?mobile=${encodeURIComponent(mobile)}`, { cache: 'no-store' })
  .then(readResponse)
  .then((payload) => asArray(payload, ['bookings', 'items', 'results']).map(normalizeBooking));

export const getBookingById = async (id, token, mobile) => {
  if (mobile) return fetch(`${API_URL}/api/bookings/track/${encodeURIComponent(id)}?mobile=${encodeURIComponent(mobile)}`, { cache: 'no-store' }).then(readResponse).then(normalizeBooking);
  if (!token) return fetch(`${API_URL}/api/bookings/track/${encodeURIComponent(id)}`, { cache: 'no-store' }).then(readResponse).then(normalizeBooking);
  return fetch(`${API_URL}/api/bookings/admin/${encodeURIComponent(id)}`, { credentials: 'include' }).then(readResponse).then(normalizeBooking);
};

export const getAdminStats = async () => fetch(`${API_URL}/api/admin-analytics/dashboard`, { credentials: 'include' })
  .then(readResponse)
  .then((payload) => {
    const stats = payload?.stats || {};
    const bookingsByService = {};
    (payload?.serviceBreakdown || []).forEach((item) => {
      if (item.serviceType) bookingsByService[item.serviceType] = item.bookings || 0;
    });
    return {
      ...payload,
      ...stats,
      todayBookings: stats.todayBookings || 0,
      pendingBookings: stats.pendingBookings || 0,
      confirmedBookings: stats.inProgressBookings || 0,
      completedThisMonth: stats.completedBookings || 0,
      dailyBookings: payload?.dailyBookingGraph || [],
      bookingsByService,
      recentBookings: (payload?.recentBookings || []).map(normalizeBooking),
    };
  });
export const getAdminAnalyticsOverview = async () => fetch(`${API_URL}/api/admin-analytics/overview`, { credentials: 'include' }).then(readResponse);

export const getAllBookings = async (filters = {}) => {
  const query = queryString(filters);
  return fetch(`${API_URL}/api/bookings/admin/all${query ? `?${query}` : ''}`, { credentials: 'include' })
    .then(readResponse)
    .then((payload) => {
      const bookings = asArray(payload, ['bookings', 'items', 'results'])
        .filter((booking) => booking.status !== 'draft')
        .map(normalizeBooking);
      return { bookings, total: payload?.total ?? payload?.count ?? bookings.length };
    });
};

export const updateBookingDetails = async (id, data) => fetch(`${API_URL}/api/bookings/admin/${encodeURIComponent(id)}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(data),
}).then(readResponse).then(normalizeBooking);

export const updateBookingStatus = async (id, status, note = '') => fetch(`${API_URL}/api/bookings/admin/${encodeURIComponent(id)}/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ status, note }),
}).then(readResponse);

export const updateBookingQuote = async (id, data) => fetch(`${API_URL}/api/bookings/admin/${encodeURIComponent(id)}/quote`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(data),
}).then(readResponse);

export const getPricing = async () => fetch(`${API_URL}/api/booking-pricing-rules/admin/all`, { credentials: 'include' }).then(readResponse).then((payload) => asArray(payload, ['rules', 'pricing', 'items', 'results']));

export const updatePricingItem = async (id, updateData) => fetch(`${API_URL}/api/booking-pricing-rules/admin/${encodeURIComponent(id)}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(updateData),
}).then(readResponse);

export const getUsers = async (filters = {}) => {
  const query = queryString(filters);
  return fetch(`${API_URL}/api/bookings/admin/customers${query ? `?${query}` : ''}`, { credentials: 'include' })
    .then(readResponse)
    .then((payload) => asArray(payload, ['users', 'customers', 'items', 'results']));
};

export const getNotifications = async (filters = {}) => {
  const query = queryString(filters);
  return fetch(`${API_URL}/api/notification${query ? `?${query}` : ''}`, { credentials: 'include' })
    .then(readResponse)
    .then((payload) => asArray(payload, ['notifications', 'items', 'results']));
};

export const sendNotification = async (data) => fetch(`${API_URL}/api/notification/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(data),
}).then(readResponse);

export const broadcastNotification = async (data) => fetch(`${API_URL}/api/notification/broadcast`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(data),
}).then(readResponse);

export const getInAppNotifications = async (filters = {}) => {
  const query = queryString(filters);
  return fetch(`${API_URL}/api/in-app-notifications${query ? `?${query}` : ''}`, { credentials: 'include' })
    .then(readResponse)
    .then((payload) => asArray(payload, ['notifications', 'alerts', 'items', 'results']));
};

export const getInAppNotificationSummary = async () => fetch(`${API_URL}/api/in-app-notifications/summary`, { credentials: 'include' }).then(readResponse);
export const markInAppNotificationRead = async (id) => fetch(`${API_URL}/api/in-app-notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH', credentials: 'include' }).then(readResponse);
export const markAllInAppNotificationsRead = async () => fetch(`${API_URL}/api/in-app-notifications/read-all`, { method: 'PATCH', credentials: 'include' }).then(readResponse);
