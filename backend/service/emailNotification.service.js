const { Resend } = require("resend");
const EmailNotificationSetting = require("../schema/EmailNotificationSetting.model");
const ApiError = require("../utility/apierror");
const logger = require("../utility/logger");

const EMAIL_KEY = "booking_confirmation";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_EMAIL_TEMPLATE = {
  subject: "New booking received: {{bookingId}}",
  html: `<div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6">
  <h2 style="margin:0 0 12px;color:#0284c7">New booking received</h2>
  <p><strong>Customer:</strong> {{customerName}}</p>
  <p><strong>Booking ID:</strong> {{bookingId}}</p>
  <p><strong>Contact number:</strong> {{contactNumber}}</p>
  <p><strong>Service booked:</strong> {{serviceBooked}}</p>
  <p><strong>Pickup:</strong> {{pickupLocation}}</p>
  <p><strong>Drop:</strong> {{dropLocation}}</p>
  <div style="margin:18px 0;padding:16px;border-radius:12px;background:#e0f2fe;color:#075985">
    <span style="display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Total price</span>
    <strong style="display:block;margin-top:4px;font-size:28px;line-height:1.2">{{totalPrice}}</strong>
  </div>
</div>`,
};

const serviceLabels = {
  local_shifting: "Local Shifting",
  intercity_moving: "Intercity Moving",
  porter_labour_service: "Labour & Vehicle",
};

const normalizeRecipients = (recipients = []) => {
  const list = Array.isArray(recipients) ? recipients : String(recipients || "").split(",");
  return [...new Set(list.map((email) => String(email || "").trim().toLowerCase()).filter(Boolean))]
    .filter((email) => EMAIL_PATTERN.test(email));
};

const ensureSettings = async () => {
  const existing = await EmailNotificationSetting.findOne({ key: EMAIL_KEY }).lean();
  if (existing) return existing;
  return EmailNotificationSetting.findOneAndUpdate(
    { key: EMAIL_KEY },
    {
      $setOnInsert: {
        key: EMAIL_KEY,
        recipients: [],
        template: DEFAULT_EMAIL_TEMPLATE,
        isActive: true,
        updatedBy: "system",
      },
    },
    { new: true, upsert: true, runValidators: true },
  ).lean();
};

const getSettings = async () => ensureSettings();

const updateSettings = async (payload = {}) => {
  const subject = String(payload.template?.subject ?? payload.subject ?? "").trim();
  const html = String(payload.template?.html ?? payload.html ?? "").trim();
  if (!subject) throw new ApiError(400, "Email subject template is required");
  if (!html) throw new ApiError(400, "Email HTML template is required");

  return EmailNotificationSetting.findOneAndUpdate(
    { key: EMAIL_KEY },
    {
      $set: {
        recipients: normalizeRecipients(payload.recipients),
        template: { subject, html },
        isActive: payload.isActive !== false,
        updatedBy: payload.updatedBy || "admin",
      },
    },
    { new: true, upsert: true, runValidators: true },
  ).lean();
};

const renderTemplate = (template = "", values = {}) => String(template || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => (
  values[key] === undefined || values[key] === null ? "" : String(values[key])
));

const formatCurrency = (value = 0) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(Number(value) || 0);

const stripHtml = (html = "") => String(html)
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<\/p>/gi, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const bookingValues = (booking = {}) => ({
  customerName: booking.customer?.name || "Customer",
  bookingName: booking.customer?.name || "Customer",
  bookingId: booking.bookingid || booking.bookingId || "",
  contactNumber: booking.customer?.mobile || "",
  serviceBooked: serviceLabels[booking.serviceType] || String(booking.serviceType || "").replace(/_/g, " "),
  pickupLocation: booking.pickuplocation?.address || "",
  dropLocation: booking.droplocation?.address || "",
  totalPrice: formatCurrency(booking.pricing?.totalAmount || 0),
});

const sendBookingConfirmationEmail = async (booking, { source = "website" } = {}) => {
  if (source !== "website") return null;
  if (process.env.BOOKING_CONFIRMATION_EMAILS === "false") return null;

  const settings = await getSettings();
  const recipients = normalizeRecipients(settings.recipients);
  if (settings.isActive === false || recipients.length === 0) return null;
  if (!process.env.RESEND_API_KEY) {
    logger.warn("Booking confirmation email skipped because RESEND_API_KEY is not configured", {
      bookingid: booking?.bookingid,
    });
    return null;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const values = bookingValues(booking);
  const html = renderTemplate(settings.template?.html || DEFAULT_EMAIL_TEMPLATE.html, values);
  const subject = renderTemplate(settings.template?.subject || DEFAULT_EMAIL_TEMPLATE.subject, values);
  const from = process.env.RESEND_FROM_EMAIL || "Tithi Packers and Movers <onboarding@resend.dev>";

  const result = await resend.emails.send({
    from,
    to: recipients,
    subject,
    html,
    text: stripHtml(html),
  });

  logger.info("Booking confirmation email sent", {
    bookingid: booking?.bookingid,
    recipientCount: recipients.length,
    resendId: result?.data?.id,
  });
  return result;
};

module.exports = {
  DEFAULT_EMAIL_TEMPLATE,
  getSettings,
  updateSettings,
  sendBookingConfirmationEmail,
};
