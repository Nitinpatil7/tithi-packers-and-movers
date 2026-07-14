const Booking = require("../schema/Booking.model");
const InAppNotification = require("../schema/InAppNotification.model");
const ApiError = require("../utility/apierror");

const createNewBookingNotification = async (bookingOrId) => {
  const booking = bookingOrId?._id
    ? bookingOrId
    : await Booking.findById(bookingOrId);

  if (!booking) throw new ApiError(404, "Booking not found");

  return InAppNotification.findOneAndUpdate(
    { type: "new_booking", bookingId: booking._id },
    {
      $setOnInsert: {
        type: "new_booking",
        bookingId: booking._id,
        title: "New booking received",
        message: `${booking.customer?.name || "Customer"} created booking ${booking.bookingid}`,
        meta: {
          bookingNumber: booking.bookingid,
          serviceType: booking.serviceType,
          customerName: booking.customer?.name,
          scheduledAt: booking.scheduledate,
        },
      },
    },
    { new: true, upsert: true, runValidators: true },
  );
};

const getNotifications = async (query = {}) => {
  const filter = {};
  if (query.isRead === "true") filter.isRead = true;
  if (query.isRead === "false") filter.isRead = false;
  if (query.type) filter.type = query.type;

  const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100);
  return InAppNotification.find(filter)
    .populate("bookingId", "bookingid customer serviceType status scheduledate")
    .sort({ createdAt: -1 })
    .limit(limit);
};

const getDashboardSummary = async () => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

  const [todayTotalBookings, unreadCount, todayBookings, upcomingBookings] = await Promise.all([
    Booking.countDocuments({ createdAt: { $gte: startOfToday, $lte: endOfToday } }),
    InAppNotification.countDocuments({ isRead: false }),
    Booking.find({
      scheduledate: { $gte: startOfToday, $lte: endOfToday },
      status: { $nin: ["draft", "cancelled"] },
    })
      .select("bookingid customer serviceType status scheduledate timeslot pickuplocation droplocation")
      .sort({ scheduledate: 1 }),
    Booking.find({
      scheduledate: { $gte: now, $lte: nextHour },
      status: { $nin: ["completed", "cancelled"] },
    })
      .select("bookingid customer serviceType status scheduledate pickuplocation droplocation")
      .sort({ scheduledate: 1 }),
  ]);

  return {
    todayTotalBookings,
    unreadCount,
    todayBookings,
    upcomingWithinMinutes: 60,
    upcomingBookings,
  };
};

const markAsRead = async (id) => {
  const notification = await InAppNotification.findByIdAndUpdate(
    id,
    { $set: { isRead: true, readAt: new Date() } },
    { new: true },
  );
  if (!notification) throw new ApiError(404, "In-app notification not found");
  return notification;
};

const markAllAsRead = async () => {
  const result = await InAppNotification.updateMany(
    { isRead: false },
    { $set: { isRead: true, readAt: new Date() } },
  );
  return { updatedCount: result.modifiedCount };
};

const deleteNotification = async (id) => {
  const notification = await InAppNotification.findByIdAndDelete(id);
  if (!notification) throw new ApiError(404, "In-app notification not found");
  return notification;
};

module.exports = {
  createNewBookingNotification,
  getNotifications,
  getDashboardSummary,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
