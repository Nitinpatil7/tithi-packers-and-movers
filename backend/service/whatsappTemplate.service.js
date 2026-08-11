const siteSettingService = require("./Sitesetting.service");

const normalizeIndianMobile = (mobile) => {
  const digits = String(mobile || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const statusLabels = {
  pending: "Pending",
  quote_sent: "Quote Sent",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const buildTrackingUrl = (booking) => {
  const siteUrl = (process.env.WEBSITE_URL || process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${siteUrl}/my-bookings?bookingId=${encodeURIComponent(booking.bookingid)}&mobile=${encodeURIComponent(booking.customer.mobile)}`;
};

const buildStatusMessage = async (booking) => {
  const setting = await siteSettingService.getsitesetting();
  const company = setting.companyName || "Tithi Packers and Movers";
  const status = statusLabels[booking.status] || booking.status;
  const trackingUrl = buildTrackingUrl(booking);

  return {
    ownerWhatsappNumber: normalizeIndianMobile(setting.ownerWhatsappNumber || setting.whatsappNumber || setting.phone),
    customerWhatsappNumber: normalizeIndianMobile(booking.customer.mobile),
    message: `Hello ${booking.customer.name}, your ${company} booking ${booking.bookingid} status is now ${status}. Track your booking here: ${trackingUrl}`,
    trackingUrl,
  };
};

const buildAdminMessage = async ({ mobile, message }) => {
  const setting = await siteSettingService.getsitesetting();
  return {
    ownerWhatsappNumber: normalizeIndianMobile(setting.ownerWhatsappNumber || setting.whatsappNumber || setting.phone),
    customerWhatsappNumber: normalizeIndianMobile(mobile),
    message,
  };
};

const buildWhatsAppActionUrl = ({ customerWhatsappNumber, message }) =>
  `https://wa.me/${encodeURIComponent(customerWhatsappNumber)}?text=${encodeURIComponent(message)}`;

module.exports = {
  buildStatusMessage,
  buildAdminMessage,
  buildWhatsAppActionUrl,
};
