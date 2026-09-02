const NotificationTemplate = require("../schema/NotificationTemplate.model");
const ApiError = require("../utility/apierror");

const DEFAULT_TEMPLATES = {
  pending: {
    title: "Booking request received",
    message: "Hello {{customerName}}, your {{companyName}} booking {{bookingId}} is received and pending review. Track it here: {{trackingUrl}}",
  },
  quote_sent: {
    title: "Quote sent for your booking",
    message: "Hello {{customerName}}, your quote for {{companyName}} booking {{bookingId}} has been shared. Track it here: {{trackingUrl}}",
  },
  confirmed: {
    title: "Booking confirmed",
    message: "Hello {{customerName}}, your {{companyName}} booking {{bookingId}} is confirmed. Track it here: {{trackingUrl}}",
  },
  in_progress: {
    title: "Move in progress",
    message: "Hello {{customerName}}, your {{companyName}} booking {{bookingId}} is now in progress. Track it here: {{trackingUrl}}",
  },
  completed: {
    title: "Share your moving experience",
    message: "Hello {{customerName}}, your {{companyName}} booking {{bookingId}} is completed. Thank you for choosing us. Please share your feedback here: {{feedbackUrl}}",
  },
  cancelled: {
    title: "Booking cancelled",
    message: "Hello {{customerName}}, your {{companyName}} booking {{bookingId}} has been cancelled. Track it here: {{trackingUrl}}",
  },
};

const STATUS_KEYS = Object.keys(DEFAULT_TEMPLATES);

const getTemplates = async () => {
  const stored = await NotificationTemplate.find({}).lean();
  const byStatus = new Map(stored.map((item) => [item.status, item]));
  return STATUS_KEYS.map((status) => ({
    status,
    ...DEFAULT_TEMPLATES[status],
    ...(byStatus.get(status) || {}),
  }));
};

const getTemplate = async (status) => {
  if (!STATUS_KEYS.includes(status)) throw new ApiError(400, "Invalid notification template status");
  const template = await NotificationTemplate.findOne({ status, isActive: { $ne: false } }).lean();
  return template || { status, ...DEFAULT_TEMPLATES[status] };
};

const updateTemplate = async (status, payload = {}) => {
  if (!STATUS_KEYS.includes(status)) throw new ApiError(400, "Invalid notification template status");
  const title = String(payload.title || "").trim();
  const message = String(payload.message || "").trim();
  if (!title) throw new ApiError(400, "Template title is required");
  if (!message) throw new ApiError(400, "Template message is required");

  return NotificationTemplate.findOneAndUpdate(
    { status },
    {
      $set: {
        title,
        message,
        isActive: payload.isActive !== false,
        updatedBy: payload.updatedBy || "admin",
      },
    },
    { new: true, upsert: true, runValidators: true },
  );
};

const renderTemplate = (template = "", values = {}) => String(template || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => (
  values[key] === undefined || values[key] === null ? "" : String(values[key])
));

module.exports = {
  DEFAULT_TEMPLATES,
  getTemplates,
  getTemplate,
  updateTemplate,
  renderTemplate,
};
