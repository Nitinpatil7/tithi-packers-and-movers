const Booking = require("../schema/Booking.model");

const BUSINESS_BOOKINGS = { status: { $nin: ["draft", "cancelled"] } };
const SERVICE_LABELS = {
  local_shifting: "Local Shifting",
  intercity_moving: "Intercity Moving",
  porter_labour_service: "Labour & Vehicle",
};

const startOfUtcDay = (date) => {
  const value = new Date(date);
  value.setUTCHours(0, 0, 0, 0);
  return value;
};

const moneyExpression = { $ifNull: ["$pricing.totalAmount", 0] };

const getDashboard = async () => {
  const graphStart = startOfUtcDay(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));
  const todayStart = startOfUtcDay(new Date());

  const [summaryRows, serviceRows, dailyRows, recentBookings] = await Promise.all([
    Booking.aggregate([
      { $match: BUSINESS_BOOKINGS },
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
      { $match: BUSINESS_BOOKINGS },
      { $group: { _id: "$serviceType", bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
    ]),
    Booking.aggregate([
      { $match: { ...BUSINESS_BOOKINGS, createdAt: { $gte: graphStart } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Booking.find(BUSINESS_BOOKINGS)
      .select("bookingid customer.name customer.mobile serviceType status scheduledate pricing.totalAmount createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const dailyMap = new Map(dailyRows.map((row) => [row._id, row.bookings]));
  const dailyBookingGraph = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(graphStart.getTime() + index * 24 * 60 * 60 * 1000);
    const key = date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
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
  };
};

const getAnalytics = async () => {
  const currentStart = startOfUtcDay(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));
  const previousStart = startOfUtcDay(new Date(Date.now() - 59 * 24 * 60 * 60 * 1000));

  const [overallRows, serviceRows, periodRows] = await Promise.all([
    Booking.aggregate([
      { $match: BUSINESS_BOOKINGS },
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
      { $match: BUSINESS_BOOKINGS },
      { $group: { _id: "$serviceType", bookings: { $sum: 1 }, estimatedRevenue: { $sum: moneyExpression } } },
      { $sort: { bookings: -1 } },
    ]),
    Booking.aggregate([
      { $match: { ...BUSINESS_BOOKINGS, createdAt: { $gte: previousStart } } },
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
  };
};

module.exports = { getDashboard, getAnalytics };
