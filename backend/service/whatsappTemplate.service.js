const siteSettingService = require("./Sitesetting.service");
const crypto = require("crypto");
const notificationTemplateService = require("./notificationTemplate.service");

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

const buildFeedbackUrl = (token = "") => {
  const siteUrl = (process.env.WEBSITE_URL || process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
  return token ? `${siteUrl}/feedback/${encodeURIComponent(token)}` : `${siteUrl}/feedback`;
};

const ensureFeedbackToken = async (booking) => {
  if (booking.feedback?.token) return booking.feedback.token;
  const token = crypto.randomBytes(24).toString("hex");
  booking.feedback = {
    ...(booking.feedback || {}),
    token,
    requestedAt: new Date(),
  };
  await booking.save({ validateBeforeSave: false });
  return token;
};

const buildStatusMessage = async (booking) => {
  const setting = await siteSettingService.getsitesetting();
  const company = setting.companyName || "Tithi Packers and Movers";
  const status = statusLabels[booking.status] || booking.status;
  const trackingUrl = buildTrackingUrl(booking);
  const feedbackUrl = booking.status === "completed" ? buildFeedbackUrl() : (booking.feedback?.token ? buildFeedbackUrl(booking.feedback.token) : "");
  const template = await notificationTemplateService.getTemplate(booking.status);
  const values = {
    companyName: company,
    customerName: booking.customer.name,
    bookingId: booking.bookingid,
    status,
    trackingUrl: booking.status === "completed" ? feedbackUrl : trackingUrl,
    feedbackUrl,
  };

  return {
    ownerWhatsappNumber: normalizeIndianMobile(setting.ownerWhatsappNumber || setting.whatsappNumber || setting.phone),
    customerWhatsappNumber: normalizeIndianMobile(booking.customer.mobile),
    message: notificationTemplateService.renderTemplate(template.message, values),
    title: notificationTemplateService.renderTemplate(template.title, values),
    trackingUrl: booking.status === "completed" ? undefined : trackingUrl,
    feedbackUrl: booking.status === "completed" ? feedbackUrl : undefined,
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
