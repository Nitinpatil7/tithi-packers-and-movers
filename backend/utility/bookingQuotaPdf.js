const PDFDocument = require("pdfkit");
const { calculateItemBreakdown } = require("./bookingPricingSnapshot");

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

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const asObject = (value = {}) => (value && typeof value.toObject === "function" ? value.toObject() : value) || {};
const formatCurrency = (value = 0) => `₹${toNumber(value).toFixed(2)}`;
const formatDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const getPricing = (booking = {}) => asObject(booking.pricing);
const getBreakdown = (booking = {}) => asObject(getPricing(booking).breakdown);
const getTotal = (booking = {}) => toNumber(getPricing(booking).totalAmount);
const getBookingId = (booking = {}) => booking.bookingid || booking.bookingId || "";
const getCustomer = (booking = {}) => asObject(booking.customer);
const getLocation = (booking = {}, key) => asObject(booking[key]);
const getItems = (booking = {}) => (booking.items || []).map(asObject);
const getAddons = (booking = {}) => (booking.selectedAddons || []).map(asObject);

const line = (doc, label, value, options = {}) => {
  const x = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const y = doc.y;
  doc.font(options.bold ? "Helvetica-Bold" : "Helvetica").fontSize(options.size || 10).fillColor(options.color || TEXT);
  doc.text(label, x, y, { width: width - 120 });
  doc.text(value, x + width - 115, y, { width: 115, align: "right" });
  doc.moveDown(0.55);
};

const section = (doc, title) => {
  doc.moveDown(0.55);
  const x = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  doc.roundedRect(x, doc.y, width, 22, 3).fill(LIGHT);
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(11).text(title, x + 8, doc.y + 6, { width: width - 16 });
  doc.moveDown(1.3);
};

const addRows = (doc, rows = [], emptyLabel = "No entries") => {
  if (!rows.length) {
    doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(emptyLabel);
    return;
  }
  rows.forEach((row) => line(doc, row.label, formatCurrency(row.value), row));
};

const drawHeader = (doc, booking) => {
  const pricing = getPricing(booking);
  const customer = getCustomer(booking);
  const pickup = getLocation(booking, "pickuplocation");
  const drop = getLocation(booking, "droplocation");
  const x = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const headerY = doc.y;

  doc.roundedRect(x, headerY, width, 124, 6).fill(LIGHT);
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(20).text("Tithi Packers & Movers", x + 16, headerY + 16);
  doc.fillColor(TEXT).fontSize(10).text("Booking Quotation", x + 16, headerY + 42);
  doc.fillColor(ACCENT).fontSize(18).text(formatCurrency(pricing.totalAmount), x + width - 180, headerY + 18, { width: 164, align: "right" });
  doc.fillColor(MUTED).font("Helvetica").fontSize(8).text("Total Quotation Amount", x + width - 180, headerY + 44, { width: 164, align: "right" });
  doc.y = headerY + 68;

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
  const startY = doc.y;
  details.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const tx = x + 16 + col * colWidth;
    const ty = startY + row * 17;
    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(7).text(label.toUpperCase(), tx, ty, { width: 82 });
    doc.fillColor(TEXT).font("Helvetica").fontSize(8.5).text(String(value || "-"), tx + 84, ty, { width: colWidth - 94, ellipsis: true });
  });
  doc.y = startY + Math.ceil(details.length / 2) * 17 + 8;
  doc.moveDown(1.2);
};

const drawItemsGrid = (doc, booking) => {
  section(doc, "Selected Items");
  const items = getItems(booking);
  if (!items.length) {
    doc.fillColor(MUTED).font("Helvetica").fontSize(10).text("No selected items for this booking.");
    return;
  }
  const x = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const gap = 12;
  const cellWidth = (width - gap) / 2;
  const cellHeight = 38;
  items.forEach((item, index) => {
    const col = index % 2;
    if (doc.y + cellHeight > doc.page.height - doc.page.margins.bottom) doc.addPage();
    const y = doc.y;
    const cellX = x + col * (cellWidth + gap);
    doc.roundedRect(cellX, y, cellWidth, cellHeight, 4).strokeColor(BORDER).lineWidth(1).stroke();
    doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(9.5).text(item.name || "Selected item", cellX + 9, y + 8, { width: cellWidth - 88, ellipsis: true });
    doc.fillColor(MUTED).font("Helvetica").fontSize(8).text(`Qty ${toNumber(item.quantity, 1)}${item.sizeTag ? ` - ${item.sizeTag}` : ""}`, cellX + 9, y + 22, { width: cellWidth - 88 });
    doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(9).text(formatCurrency(toNumber(item.unitPrice ?? item.price)), cellX + cellWidth - 76, y + 13, { width: 66, align: "right" });
    if (col === 1 || index === items.length - 1) doc.y = y + cellHeight + 8;
  });
};

const drawAddons = (doc, booking) => {
  const addons = getAddons(booking);
  if (!addons.length) return;
  section(doc, "Add-ons");
  addRows(doc, addons.map((addon) => ({
    label: `${addon.name || "Add-on"}${addon.quantity ? ` x ${addon.quantity}` : ""}`,
    value: toNumber(addon.total ?? addon.pricesnapshot),
  })));
};

const getAllowanceRuleFromBooking = (booking = {}) => ({
  freeItemAllowance: getBreakdown(booking).freeItemAllowance || [],
});

const summarizeFreeAllowance = (booking = {}, calculated = {}) => {
  const allowanceEntries = Object.entries(calculated.allowances || {});
  if (!allowanceEntries.length) return "No free item allowance configured";
  return allowanceEntries.map(([sizeKey, quantity]) => `${quantity} ${sizeKey}`).join(", ");
};

const drawPricingBreakdown = (doc, booking) => {
  const pricing = getPricing(booking);
  const breakdown = getBreakdown(booking);
  const calculatedItems = calculateItemBreakdown(getItems(booking), getAllowanceRuleFromBooking(booking), { includeItemUnits: true });
  const itemBreakdown = breakdown.itemBreakdown || calculatedItems;
  const addons = getAddons(booking);

  doc.addPage();
  doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(18).text("Pricing Breakdown");

  section(doc, "1. Base Local Charge");
  line(doc, "Base service charge", formatCurrency(breakdown.basePrice ?? pricing.serviceCharge ?? 0));
  doc.fillColor(MUTED).font("Helvetica").fontSize(9).text(`Free Allowance Included: ${summarizeFreeAllowance(booking, itemBreakdown)}`);

  section(doc, "2. Extra/Paid Allowance Items");
  addRows(doc, calculatedItems.chargedAllowanceItems.map((unit) => ({ label: unit.name, value: unit.unitPrice })), "No selected items exceeded the free allowance.");
  line(doc, "Extra allowance subtotal", formatCurrency(itemBreakdown.charge ?? pricing.itemTotal), { bold: true });

  section(doc, "3. Base Item List with Pricing");
  addRows(doc, calculatedItems.includedItems.map((unit) => ({ label: unit.name, value: unit.unitPrice })), "No selected items are included in the base allowance.");

  section(doc, "4. Extra Items with Charges");
  addRows(doc, [], "No separate extra item charges beyond the paid allowance items above.");

  if (addons.length) {
    section(doc, "5. Add-ons");
    addRows(doc, addons.map((addon) => ({
      label: `${addon.name || "Add-on"}${addon.quantity ? ` x ${addon.quantity}` : ""}`,
      value: toNumber(addon.total ?? addon.pricesnapshot),
    })));
  }

  const logisticsRows = [
    { label: "Distance charge", value: breakdown.distanceCharge },
    { label: "Pickup floor / lift charge", value: breakdown.pickupFloorCharge },
    { label: "Drop floor / lift charge", value: breakdown.dropFloorCharge },
    { label: "Floor charge", value: breakdown.floorTotalCharge },
    { label: "Truck charge", value: breakdown.truckTotal },
    { label: "Labour charge", value: breakdown.employeeTotal },
    { label: "Sunday hike", value: breakdown.sundayHike },
    { label: "Rate adjustment", value: breakdown.rateAdjustmentAmount },
  ].filter((row) => toNumber(row.value) > 0);
  section(doc, "6. Logistics Charges");
  addRows(doc, logisticsRows, "No extra logistics charges apply.");

  section(doc, "7. GRAND TOTAL");
  const x = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const totalY = doc.y;
  doc.roundedRect(x, totalY, width, 34, 4).fill(ACCENT);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(13).text("GRAND TOTAL", x + 10, totalY + 10, { width: width / 2 });
  doc.text(formatCurrency(getTotal(booking)), x + width - 160, totalY + 10, { width: 150, align: "right" });
};

const generateBookingQuotaPDF = async (booking) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ size: "A4", margin: 42, bufferPages: true });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("error", reject);
  doc.on("end", () => resolve(Buffer.concat(chunks)));

  drawHeader(doc, booking);
  drawItemsGrid(doc, booking);
  drawAddons(doc, booking);
  drawPricingBreakdown(doc, booking);
  doc.end();
});

module.exports = {
  generateBookingQuotaPDF,
};
