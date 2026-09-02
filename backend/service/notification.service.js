
const Notification = require("../schema/Notification.model")
const ApiError = require("../utility/apierror");
const {
  enqueueNotificationDelivery,
  processNotification,
} = require("../queue/notification.queue");
const {
  buildAdminMessage,
  buildWhatsAppActionUrl,
} = require("./whatsappTemplate.service");

const sendSingleNotification = async (payload) => {
  let providerPayload = payload.providerPayload || null;
  let meta = payload.meta || {};

  if (payload.channel === "whatsapp" && !providerPayload) {
    providerPayload = await buildAdminMessage({
      mobile: payload.customerMobile,
      message: payload.message,
    });
  }

  if (payload.channel === "whatsapp" && providerPayload) {
    meta = {
      ...meta,
      whatsappActionUrl: buildWhatsAppActionUrl(providerPayload),
      ownerWhatsappNumber: providerPayload.ownerWhatsappNumber,
      trackingUrl: providerPayload.trackingUrl,
      feedbackUrl: providerPayload.feedbackUrl,
    };
  }

  const notification = await Notification.create({
    bookingId: payload.bookingId || null,
    customerMobile: payload.customerMobile,
    customerName: payload.customerName,
    channel: payload.channel,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    createdBy: payload.createdBy || "admin",
    meta,
    status: "pending",
  });

  try {
    await enqueueNotificationDelivery({
      notificationId: notification._id.toString(),
      providerPayload,
    });
  } catch (error) {
    await processNotification({
      data: {
        notificationId: notification._id.toString(),
        providerPayload,
      },
    });
  }

  return Notification.findById(notification._id);
};

const sendBroadcastNotification = async (payload) => {
  const {
    targetCustomers = [],
    channel = "whatsapp",
    type = "admin_broadcast",
    title,
    message,
    meta = {},
  } = payload;

  throw new ApiError(400, "Broadcast notifications are disabled for now. Send a single customer message.");
};

const sendBookingNotification = async ({
  booking,
  channel = "whatsapp",
  type,
  title,
  message,
  meta = {},
}) => {
  if (!booking?.customer?.mobile) {
    throw new ApiError(400, "Booking customer mobile is required");
  }

  const notification = await sendSingleNotification({
    bookingId: booking._id,
    customerMobile: booking.customer.mobile,
    customerName: booking.customer.name,
    channel,
    type,
    title,
    message,
    createdBy: "system",
    meta,
  });

  return notification;
};

const getAllNotifications = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.channel) {
    filter.channel = query.channel;
  }

  if (query.customerMobile) {
    filter.customerMobile = query.customerMobile;
  }

  if (query.bookingId) {
    filter.bookingId = query.bookingId;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(query.limit) || 100);

  return notifications;
};

const getNotificationById = async (notificationId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return notification;
};

const deleteNotification = async (notificationId) => {
  const notification = await Notification.findByIdAndDelete(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return notification;
};

module.exports = {
  sendSingleNotification,
  sendBroadcastNotification,
  sendBookingNotification,
  getAllNotifications,
  getNotificationById,
  deleteNotification,
};
