
const Notification = require("../schema/Notification.model")
const ApiError = require("../utility/apierror");
const messageProviderService = require("../service/messageProvider.service");

const sendSingleNotification = async (payload) => {
  const notification = await Notification.create({
    bookingId: payload.bookingId || null,
    customerMobile: payload.customerMobile,
    customerName: payload.customerName,
    channel: payload.channel,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    createdBy: payload.createdBy || "admin",
    meta: payload.meta || {},
    status: "pending",
  });

  const result = await messageProviderService({
    channel: notification.channel,
    mobile: notification.customerMobile,
    message: notification.message,
    templateName: payload.templateName,
    language: payload.language,
    parameters: payload.parameters,
  });

  if (result.success) {
    notification.status = "sent";
    notification.provider = result.provider;
    notification.providerMessageId = result.providerMessageId;
    notification.providerResponse = result.response;
    notification.sentAt = new Date();
  } else {
    notification.status = "failed";
    notification.provider = result.provider;
    notification.providerResponse = result.response;
    notification.errorMessage = result.errorMessage;
  }

  await notification.save();

  return notification;
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

  if (!targetCustomers.length) {
    throw new ApiError(400, "Target customers are required");
  }

  const results = [];

  for (const customer of targetCustomers) {
    const notification = await sendSingleNotification({
      customerMobile: customer.mobile,
      customerName: customer.name,
      channel,
      type,
      title,
      message,
      createdBy: "admin",
      meta,
    });

    results.push(notification);
  }

  return results;
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
