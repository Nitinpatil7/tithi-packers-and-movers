const notificationService = require("./notification.service");
const logger = require("../utility/logger");

const isEnabled = () => process.env.WHATSAPP_ENABLED === "true";

const safelySend = async (payload) => {
  try {
    return await notificationService.sendSingleNotification(payload);
  } catch (error) {
    logger.error("WhatsApp notification failed", {
      bookingId: payload.bookingId,
      type: payload.type,
      error: error.message,
    });
    return { failed: true, error: error.message };
  }
};

const getBookingTrackingUrl = (booking) => {
  const siteUrl = (process.env.WEBSITE_URL || process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
  const mobile = encodeURIComponent(booking.customer.mobile);
  return `${siteUrl}/my-bookings?bookingId=${encodeURIComponent(booking.bookingid)}&mobile=${mobile}`;
};

const sendBookingConfirmation = async (booking) => safelySend({
  bookingId: booking._id,
  customerMobile: booking.customer.mobile,
  customerName: booking.customer.name,
  channel: "whatsapp",
  type: "booking_created",
  title: "Booking confirmed",
  message: `Congratulations ${booking.customer.name}, your Tithi booking ${booking.bookingid} is confirmed. Track your booking here: ${getBookingTrackingUrl(booking)}`,
  createdBy: "system",
  templateName: process.env.WHATSAPP_BOOKING_CONFIRMED_TEMPLATE,
  language: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en",
  parameters: [
    booking.customer.name,
    booking.bookingid,
    getBookingTrackingUrl(booking),
  ],
  meta: { event: "booking_confirmed", trackingUrl: getBookingTrackingUrl(booking) },
});

const sendBookingStatusUpdate = async (booking) => safelySend({
  bookingId: booking._id,
  customerMobile: booking.customer.mobile,
  customerName: booking.customer.name,
  channel: "whatsapp",
  type: "status_update",
  title: "Booking status updated",
  message: `Booking ${booking.bookingid} status changed to ${booking.status}`,
  createdBy: "system",
  templateName: process.env.WHATSAPP_STATUS_UPDATE_TEMPLATE,
  language: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en",
  parameters: [booking.customer.name, booking.bookingid, booking.status],
  meta: { event: "booking_status_updated", status: booking.status },
});

module.exports = {
  isEnabled,
  getBookingTrackingUrl,
  sendBookingConfirmation,
  sendBookingStatusUpdate,
};
