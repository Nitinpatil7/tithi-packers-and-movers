const Booking = require("../schema/Booking.model");
const Testimonial = require("../schema/Testimonial.model");

const BUSINESS_BOOKINGS = { status: { $nin: ["draft", "cancelled"] } };
const SERVICE_LABELS = {
  local_shifting: "Local Shifting",
  intercity_moving: "Intercity Moving",
  porter_labour_service: "Labour & Vehicle",
};
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfUtcDay = (date) => {
  const value = new Date(date);
  value.setUTCHours(0, 0, 0, 0);
  return value;
};

const toDateKey = (date) => date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const fromDateKey = (dateKey) => new Date(`${dateKey}T00:00:00+05:30`);
const endAfterDateKey = (dateKey) => new Date(fromDateKey(dateKey).getTime() + DAY_MS);
const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);
const padMonth = (month) => String(month).padStart(2, "0");

const resolveDateRange = (params = {}) => {
  const now = new Date();
  const todayKey = toDateKey(now);
  const todayStart = fromDateKey(todayKey);
  const range = String(params.range || "month").toLowerCase();

  if (range === "custom" && params.startDate && params.endDate) {
    const start = fromDateKey(params.startDate);
    const end = endAfterDateKey(params.endDate);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      return start <= end
        ? { key: range, start, end, startDate: params.startDate, endDate: params.endDate }
        : { key: range, start: fromDateKey(params.endDate), end: endAfterDateKey(params.startDate), startDate: params.endDate, endDate: params.startDate };
    }
  }

  if (range === "day") {
    return { key: range, start: todayStart, end: addDays(todayStart, 1), startDate: todayKey, endDate: todayKey };
  }

  if (range === "week") {
    const day = todayStart.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const start = addDays(todayStart, mondayOffset);
    const end = addDays(start, 7);
    return { key: range, start, end, startDate: toDateKey(start), endDate: toDateKey(addDays(end, -1)) };
  }

  if (range === "year") {
    const year = Number(todayKey.slice(0, 4));
    const start = fromDateKey(`${year}-01-01`);
    const end = fromDateKey(`${year + 1}-01-01`);
    return { key: range, start, end, startDate: `${year}-01-01`, endDate: `${year}-12-31` };
  }

  const year = Number(todayKey.slice(0, 4));
  const month = Number(todayKey.slice(5, 7));
  const monthStartKey = `${year}-${padMonth(month)}-01`;
  const nextMonthKey = month === 12 ? `${year + 1}-01-01` : `${year}-${padMonth(month + 1)}-01`;
  const monthStart = fromDateKey(monthStartKey);
  const monthEnd = fromDateKey(nextMonthKey);
  return { key: "month", start: monthStart, end: monthEnd, startDate: monthStartKey, endDate: toDateKey(addDays(monthEnd, -1)) };
};

const dateRangeMatch = (range) => ({
  ...BUSINESS_BOOKINGS,
  createdAt: { $gte: range.start, $lt: range.end },
});

const moneyExpression = { $ifNull: ["$pricing.totalAmount", 0] };

const getDashboard = async (params = {}) => {
  const range = resolveDateRange(params);
  const dashboardMatch = dateRangeMatch(range);
  const graphStart = range.start;
  const graphDays = Math.max(1, Math.ceil((range.end.getTime() - range.start.getTime()) / DAY_MS));
  const todayStart = startOfUtcDay(new Date());

  const [summaryRows, serviceRows, dailyRows, recentBookings, pendingFeedbackCount] = await Promise.all([
    Booking.aggregate([
      { $match: dashboardMatch },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          todayBookings: { $sum: { $cond: [{ $gte: ["$createdAt", todayStart] }, 1, 0] } },
          pendingBookings: { $sum: { $cond: [{ $in: ["$status", ["pending", "quote_sent"]] }, 1, 0] } },
          inProgressBookings: { $sum: { $cond: [{ $in: ["$status", ["confirmed", "in_progress"]] }, 1, 0] } },
          completedBookings: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
    Booking.aggregate([
      { $match: dashboardMatch },
      { $group: { _id: "$serviceType", bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
    ]),
    Booking.aggregate([
      { $match: dashboardMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Booking.find(dashboardMatch)
      .select("bookingid customer.name customer.mobile serviceType status scheduledate pricing.totalAmount createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Testimonial.countDocuments({ status: "inactive", submittedAt: { $exists: true } }),
  ]);

  const dailyMap = new Map(dailyRows.map((row) => [row._id, row.bookings]));
  const dailyBookingGraph = Array.from({ length: graphDays }, (_, index) => {
    const date = new Date(graphStart.getTime() + index * DAY_MS);
    const key = toDateKey(date);
    return { date: key, bookings: dailyMap.get(key) || 0 };
  });
  const mostUsed = serviceRows[0] || null;

  return {
    stats: summaryRows[0] || {
      totalBookings: 0,
      todayBookings: 0,
      pendingBookings: 0,
      inProgressBookings: 0,
      completedBookings: 0,
    },
    dailyBookingGraph,
    mostUsedService: mostUsed
      ? { serviceType: mostUsed._id, label: SERVICE_LABELS[mostUsed._id] || mostUsed._id, bookings: mostUsed.bookings }
      : null,
    serviceBreakdown: serviceRows.map((row) => ({
      serviceType: row._id,
      label: SERVICE_LABELS[row._id] || row._id,
      bookings: row.bookings,
    })),
    recentBookings,
    pendingFeedbackCount,
    range: { key: range.key, startDate: range.startDate, endDate: range.endDate },
  };
};

const getAnalytics = async (params = {}) => {
  const range = resolveDateRange(params);
  const analyticsMatch = dateRangeMatch(range);
  const duration = Math.max(DAY_MS, range.end.getTime() - range.start.getTime());
  const currentStart = range.start;
  const previousStart = new Date(range.start.getTime() - duration);

  const [overallRows, serviceRows, periodRows] = await Promise.all([
    Booking.aggregate([
      { $match: analyticsMatch },
      {
        $group: {
          _id: null,
          estimatedRevenue: { $sum: moneyExpression },
          averageBookingValue: { $avg: moneyExpression },
          bookings: { $sum: 1 },
        },
      },
      { $project: { _id: 0, estimatedRevenue: { $round: ["$estimatedRevenue", 2] }, averageBookingValue: { $round: ["$averageBookingValue", 2] }, bookings: 1 } },
    ]),
    Booking.aggregate([
      { $match: analyticsMatch },
      { $group: { _id: "$serviceType", bookings: { $sum: 1 }, estimatedRevenue: { $sum: moneyExpression } } },
      { $sort: { bookings: -1 } },
    ]),
    Booking.aggregate([
      { $match: { ...BUSINESS_BOOKINGS, createdAt: { $gte: previousStart, $lt: range.end } } },
      {
        $group: {
          _id: null,
          currentRevenue: { $sum: { $cond: [{ $gte: ["$createdAt", currentStart] }, moneyExpression, 0] } },
          previousRevenue: { $sum: { $cond: [{ $lt: ["$createdAt", currentStart] }, moneyExpression, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
  ]);

  const overall = overallRows[0] || { estimatedRevenue: 0, averageBookingValue: 0, bookings: 0 };
  const period = periodRows[0] || { currentRevenue: 0, previousRevenue: 0 };
  const growthPercentage = period.previousRevenue > 0
    ? Number((((period.currentRevenue - period.previousRevenue) / period.previousRevenue) * 100).toFixed(2))
    : period.currentRevenue > 0 ? 100 : 0;
  const popularity = serviceRows.map((row) => ({
    serviceType: row._id,
    label: SERVICE_LABELS[row._id] || row._id,
    bookings: row.bookings,
    percentage: overall.bookings ? Number(((row.bookings / overall.bookings) * 100).toFixed(2)) : 0,
    estimatedRevenue: Number(row.estimatedRevenue.toFixed(2)),
  }));

  return {
    currency: "INR",
    estimatedRevenue: overall.estimatedRevenue,
    averageBookingValue: overall.averageBookingValue,
    highestDemandService: popularity[0] || null,
    revenueGrowth30Days: {
      currentPeriodRevenue: Number(period.currentRevenue.toFixed(2)),
      previousPeriodRevenue: Number(period.previousRevenue.toFixed(2)),
      growthPercentage,
    },
    servicePopularityBreakdown: popularity,
    range: { key: range.key, startDate: range.startDate, endDate: range.endDate },
  };
};

module.exports = { getDashboard, getAnalytics };
