const PDFDocument = require("pdfkit");

const ACCENT = "#0284c7";
const TEXT = "#0f172a";
const MUTED = "#64748b";
const BORDER = "#dbeafe";
const LIGHT = "#e0f2fe";

const serviceLabels = {
  local: "Local Shifting",
  "local-shifting": "Local Shifting",
  local_shifting: "Local Shifting",
  intercity: "Intercity Moving",
  "intercity-moving": "Intercity Moving",
  intercity_moving: "Intercity Moving",
  labour: "Labour & Vehicle",
  "labour-service": "Labour & Vehicle",
  porter_labour_service: "Labour & Vehicle",
};

const asObject = (value = {}) => (value && typeof value.toObject === "function" ? value.toObject() : value) || {};
const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
const formatDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const getBookingId = (booking = {}) => booking.bookingid || booking.bookingId || "";
const getCustomer = (booking = {}) => asObject(booking.customer);
const getLocation = (booking = {}, key) => asObject(booking[key]);
const getItems = (booking = {}) => (booking.items || []).map(asObject);
const getAddons = (booking = {}) => (booking.selectedAddons || []).map(asObject);

const contentWidth = (doc) => doc.page.width - doc.page.margins.left - doc.page.margins.right;
const ensureSpace = (doc, neededHeight) => {
  if (doc.y + neededHeight > doc.page.height - doc.page.margins.bottom) doc.addPage();
};

const section = (doc, title) => {
  ensureSpace(doc, 34);
  doc.moveDown(0.5);
  const x = doc.page.margins.left;
  const width = contentWidth(doc);
  const y = doc.y;
  doc.roundedRect(x, y, width, 22, 3).fill(LIGHT);
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(11).text(title, x + 8, y + 6, { width: width - 16 });
  doc.y = y + 31;
};

const drawHeader = (doc, booking) => {
  const customer = getCustomer(booking);
  const pickup = getLocation(booking, "pickuplocation");
  const drop = getLocation(booking, "droplocation");
  const x = doc.page.margins.left;
  const width = contentWidth(doc);
  const headerY = doc.y;

  doc.roundedRect(x, headerY, width, 158, 6).fill(LIGHT);
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(20).text("Tithi Packers & Movers", x + 16, headerY + 16);
  doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(11).text("Move Completion Checklist", x + 16, headerY + 43);
  doc.fillColor(MUTED).font("Helvetica").fontSize(8.5).text("For field verification and customer signature", x + 16, headerY + 60);

  const details = [
    ["Booking ID", getBookingId(booking)],
    ["Customer Name", customer.name || "Customer"],
    ["Mobile Number", customer.mobile || ""],
    ["Email", customer.email || ""],
    ["Service type", serviceLabels[booking.serviceType] || String(booking.serviceType || "").replace(/_/g, " ")],
    ["PDF date", formatDate(new Date())],
    ["Scheduled date", formatDate(booking.scheduledate)],
    ["Pickup", pickup.address || ""],
    ["Drop", drop.address || ""],
  ];
  const colWidth = (width - 32) / 2;
  const startY = headerY + 82;
  details.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const tx = x + 16 + col * colWidth;
    const ty = startY + row * 15;
    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(7).text(label.toUpperCase(), tx, ty, { width: 82 });
    doc.fillColor(TEXT).font("Helvetica").fontSize(8.5).text(String(value || "-"), tx + 84, ty, { width: colWidth - 94, ellipsis: true });
  });
  doc.y = headerY + 170;
};

const drawChecklistRow = (doc, leftText, rightText = "") => {
  ensureSpace(doc, 28);
  const x = doc.page.margins.left;
  const width = contentWidth(doc);
  const y = doc.y;
  doc.roundedRect(x, y, width, 24, 3).strokeColor(BORDER).lineWidth(1).stroke();
  doc.rect(x + 10, y + 7, 10, 10).strokeColor(TEXT).lineWidth(0.9).stroke();
  doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(9.8).text(leftText || "Selected item", x + 30, y + 7, { width: width - 110, ellipsis: true });
  if (rightText) {
    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(9).text(rightText, x + width - 70, y + 7, { width: 60, align: "right" });
  }
  doc.y = y + 29;
};

const drawItemsChecklist = (doc, booking) => {
  section(doc, "Selected Items Checklist");
  const items = getItems(booking);
  if (!items.length) {
    doc.fillColor(MUTED).font("Helvetica").fontSize(10).text("No selected items for this booking.");
    doc.moveDown(0.7);
    return;
  }
  items.forEach((item) => {
    drawChecklistRow(doc, item.name || "Selected item", `Qty ${Math.max(0, toNumber(item.quantity, 0))}`);
  });
};

const drawAddonsChecklist = (doc, booking) => {
  section(doc, "Add-ons");
  const addons = getAddons(booking);
  if (!addons.length) {
    doc.fillColor(MUTED).font("Helvetica").fontSize(10).text("No add-ons selected for this booking.");
    doc.moveDown(0.7);
    return;
  }
  addons.forEach((addon) => {
    drawChecklistRow(doc, addon.name || addon.key || "Add-on service");
  });
};

const drawAdditionalItemsCard = (doc) => {
  section(doc, "Additional Items Added On Site");
  ensureSpace(doc, 118);
  const x = doc.page.margins.left;
  const width = contentWidth(doc);
  const y = doc.y;
  doc.roundedRect(x, y, width, 104, 5).strokeColor(BORDER).lineWidth(1.2).stroke();
  doc.y = y + 118;
};

const drawSignatureSection = (doc, booking) => {
  ensureSpace(doc, 78);
  const customer = getCustomer(booking);
  const x = doc.page.margins.left;
  const width = contentWidth(doc);
  const y = doc.y + 4;
  const fieldWidth = (width - 28) / 3;

  const fields = [
    ["Signature of Customer", ""],
    ["Customer Name", customer.name || ""],
    ["Date", ""],
  ];
  fields.forEach(([label, value], index) => {
    const fx = x + index * (fieldWidth + 14);
    doc.strokeColor(TEXT).lineWidth(0.8).moveTo(fx, y + 28).lineTo(fx + fieldWidth, y + 28).stroke();
    if (value) {
      doc.fillColor(TEXT).font("Helvetica").fontSize(9).text(value, fx, y + 10, { width: fieldWidth, align: "center", ellipsis: true });
    }
    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(8).text(label, fx, y + 35, { width: fieldWidth, align: "center" });
  });
  doc.y = y + 58;
};

const generateBookingQuotaPDF = async (booking) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ size: "A4", margin: 42, bufferPages: true });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("error", reject);
  doc.on("end", () => resolve(Buffer.concat(chunks)));

  drawHeader(doc, booking);
  drawItemsChecklist(doc, booking);
  drawAddonsChecklist(doc, booking);
  drawAdditionalItemsCard(doc);
  drawSignatureSection(doc, booking);
  doc.end();
});

module.exports = {
  generateBookingQuotaPDF,
};
