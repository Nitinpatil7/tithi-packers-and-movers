const PDFDocument = require("pdfkit");

const PAGE = {
  margin: 42,
  contentWidth: 511.28,
};

const COLORS = {
  ink: "#0f172a",
  muted: "#64748b",
  soft: "#f8fafc",
  line: "#dbe4ee",
  brand: "#0f766e",
  brandDark: "#115e59",
  brandSoft: "#ccfbf1",
  red: "#b91c1c",
  redDark: "#7f1d1d",
  redSoft: "#fee2e2",
  amber: "#b45309",
  amberSoft: "#fef3c7",
  blue: "#1d4ed8",
  blueSoft: "#dbeafe",
};

const formatDate = (date) => new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
}).format(new Date(date));

const formatNumber = (value = 0) => new Intl.NumberFormat("en-IN").format(Number(value) || 0);
const formatCurrency = (value = 0) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(Number(value) || 0);

const addPageNumbers = (doc) => {
  const pages = doc.bufferedPageRange();
  for (let index = 0; index < pages.count; index += 1) {
    doc.switchToPage(index);
    doc.font("Helvetica").fontSize(8).fillColor("#94a3b8")
      .text(`Tithi Packers and Movers | Page ${index + 1} of ${pages.count}`, PAGE.margin, 790, {
        width: PAGE.contentWidth,
        align: "center",
      });
  }
};

const collectPdf = (draw) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ size: "A4", margin: PAGE.margin, bufferPages: true });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => resolve(Buffer.concat(chunks)));
  doc.on("error", reject);
  draw(doc);
  addPageNumbers(doc);
  doc.end();
});

const needSpace = (doc, height) => {
  if (doc.y + height > 785) doc.addPage();
};

const pill = (doc, text, x, y, { fill = COLORS.brandSoft, color = COLORS.brandDark, width = 110 } = {}) => {
  doc.roundedRect(x, y, width, 22, 11).fill(fill);
  doc.fillColor(color).font("Helvetica-Bold").fontSize(8).text(String(text).toUpperCase(), x, y + 7, {
    width,
    align: "center",
  });
};

const coverHeader = (doc, {
  title,
  eyebrow,
  subtitle,
  mode = "report",
  generatedAt = new Date(),
}) => {
  const color = mode === "warning" ? COLORS.red : COLORS.brand;
  const dark = mode === "warning" ? COLORS.redDark : COLORS.brandDark;
  doc.rect(0, 0, doc.page.width, 132).fill(color);
  doc.rect(0, 104, doc.page.width, 28).fill(dark);

  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9)
    .text(eyebrow, PAGE.margin, 28, { characterSpacing: 0.8 });
  doc.fontSize(25).text(title, PAGE.margin, 47, { width: 370 });
  doc.font("Helvetica").fontSize(10).fillColor("#ecfeff")
    .text(subtitle, PAGE.margin, 82, { width: 380, lineGap: 2 });

  doc.roundedRect(424, 30, 116, 56, 10).fill("#ffffff");
  doc.fillColor(color).font("Helvetica-Bold").fontSize(8).text("GENERATED", 438, 44);
  doc.fillColor(COLORS.ink).fontSize(10).text(formatDate(generatedAt), 438, 58, { width: 88 });
  doc.y = 158;
};

const sectionTitle = (doc, title, subtitle = "") => {
  needSpace(doc, 58);
  doc.moveDown(0.35);
  doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(15).text(title, PAGE.margin, doc.y);
  if (subtitle) {
    doc.moveDown(0.15);
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9).text(subtitle, PAGE.margin, doc.y, {
      width: PAGE.contentWidth,
    });
  }
  doc.moveDown(0.45);
  doc.moveTo(PAGE.margin, doc.y).lineTo(PAGE.margin + PAGE.contentWidth, doc.y).strokeColor(COLORS.line).stroke();
  doc.moveDown(0.65);
};

const kpiCards = (doc, cards = [], { columns = 3 } = {}) => {
  const gap = 10;
  const cardW = (PAGE.contentWidth - gap * (columns - 1)) / columns;
  const cardH = 72;
  needSpace(doc, Math.ceil(cards.length / columns) * (cardH + gap));
  const baseY = doc.y;
  cards.forEach((card, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const x = PAGE.margin + col * (cardW + gap);
    const y = baseY + row * (cardH + gap);
    const accent = card.accent || COLORS.brand;
    doc.roundedRect(x, y, cardW, cardH, 8).fillAndStroke("#ffffff", COLORS.line);
    doc.rect(x, y, 4, cardH).fill(accent);
    doc.fillColor(COLORS.muted).font("Helvetica-Bold").fontSize(8)
      .text(card.label.toUpperCase(), x + 14, y + 14, { width: cardW - 24 });
    doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(card.valueSize || 17)
      .text(String(card.value), x + 14, y + 33, { width: cardW - 24, height: 22 });
    if (card.note) {
      doc.fillColor(COLORS.muted).font("Helvetica").fontSize(7).text(card.note, x + 14, y + 56, {
        width: cardW - 24,
      });
    }
  });
  doc.y = baseY + Math.ceil(cards.length / columns) * (cardH + gap) + 6;
};

const table = (doc, {
  title,
  columns,
  rows,
  empty = "No data available",
  maxRows = 8,
}) => {
  sectionTitle(doc, title);
  if (!rows.length) {
    doc.roundedRect(PAGE.margin, doc.y, PAGE.contentWidth, 40, 8).fillAndStroke(COLORS.soft, COLORS.line);
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10).text(empty, PAGE.margin + 14, doc.y + 14);
    doc.y += 54;
    return;
  }

  const rowH = 26;
  const headerH = 28;
  const visibleRows = rows.slice(0, maxRows);
  needSpace(doc, headerH + visibleRows.length * rowH + 20);
  const startY = doc.y;
  doc.roundedRect(PAGE.margin, startY, PAGE.contentWidth, headerH, 8).fill("#e2e8f0");
  let x = PAGE.margin;
  columns.forEach((column) => {
    doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(8)
      .text(column.label.toUpperCase(), x + 10, startY + 10, { width: column.width - 20 });
    x += column.width;
  });

  visibleRows.forEach((row, index) => {
    const y = startY + headerH + index * rowH;
    doc.rect(PAGE.margin, y, PAGE.contentWidth, rowH).fill(index % 2 ? "#ffffff" : COLORS.soft);
    x = PAGE.margin;
    columns.forEach((column) => {
      const value = column.render ? column.render(row, index) : row[column.key];
      doc.fillColor(column.color ? column.color(row) : COLORS.ink)
        .font(column.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(9)
        .text(String(value ?? ""), x + 10, y + 8, {
          width: column.width - 20,
          ellipsis: true,
        });
      x += column.width;
    });
  });
  doc.y = startY + headerH + visibleRows.length * rowH + 16;
};

const callout = (doc, {
  title,
  body,
  tone = "info",
}) => {
  const palette = tone === "danger"
    ? { fill: COLORS.redSoft, stroke: "#fecaca", title: COLORS.redDark }
    : tone === "warning"
      ? { fill: COLORS.amberSoft, stroke: "#fde68a", title: COLORS.amber }
      : { fill: COLORS.blueSoft, stroke: "#bfdbfe", title: COLORS.blue };
  needSpace(doc, 84);
  const y = doc.y;
  doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 70, 10).fillAndStroke(palette.fill, palette.stroke);
  doc.fillColor(palette.title).font("Helvetica-Bold").fontSize(12).text(title, PAGE.margin + 16, y + 14, {
    width: PAGE.contentWidth - 32,
  });
  doc.fillColor(COLORS.ink).font("Helvetica").fontSize(9).text(body, PAGE.margin + 16, y + 34, {
    width: PAGE.contentWidth - 32,
    lineGap: 2,
  });
  doc.y = y + 86;
};

const generateMonthlyReportPdf = (report) => collectPdf((doc) => {
  const hasWarnings = Boolean(report.warnings?.length);
  coverHeader(doc, {
    title: "Tithi Packers Monthly Report",
    eyebrow: "MONTHLY OPERATIONS REPORT",
    subtitle: `${report.rangeLabel} | Traffic, bookings, API health, and infrastructure signals`,
    mode: hasWarnings ? "warning" : "report",
  });

  pill(doc, hasWarnings ? "Needs Attention" : "Healthy Month", 420, 154, {
    fill: hasWarnings ? COLORS.redSoft : COLORS.brandSoft,
    color: hasWarnings ? COLORS.redDark : COLORS.brandDark,
    width: 120,
  });

  sectionTitle(doc, "Executive Summary", "A quick view of demand, conversion signals, and backend load.");
  kpiCards(doc, [
    { label: "Total Views", value: formatNumber(report.traffic.totalViews), accent: COLORS.blue },
    { label: "Total Clicks", value: formatNumber(report.traffic.totalClicks), accent: COLORS.brand },
    { label: "Unique Visitors", value: formatNumber(report.traffic.uniqueVisitors), accent: COLORS.amber },
    { label: "Bookings", value: formatNumber(report.bookings.totalBookings), accent: COLORS.brandDark },
    { label: "Revenue Estimate", value: formatCurrency(report.bookings.estimatedRevenue), valueSize: 14, accent: COLORS.blue },
    { label: "API Bandwidth", value: report.api.bandwidthLabel, valueSize: 15, accent: hasWarnings ? COLORS.red : COLORS.brand },
  ]);

  if (hasWarnings) {
    callout(doc, {
      title: "Warnings found this month",
      body: report.warnings.map((warning) => `${warning.title}: ${warning.message}`).join("  "),
      tone: "danger",
    });
  }

  table(doc, {
    title: "Top Pages",
    columns: [
      { label: "#", width: 42, render: (_row, index) => index + 1, bold: true },
      { label: "Page", width: 330, key: "path", bold: true },
      { label: "Views", width: 139, render: (row) => formatNumber(row.count) },
    ],
    rows: report.traffic.topPages || [],
  });

  table(doc, {
    title: "Top Clicks",
    columns: [
      { label: "#", width: 42, render: (_row, index) => index + 1, bold: true },
      { label: "Action", width: 275, render: (row) => row.label || row.path || "Click", bold: true },
      { label: "Page", width: 120, render: (row) => row.path || "-" },
      { label: "Clicks", width: 74, render: (row) => formatNumber(row.count) },
    ],
    rows: report.traffic.topClicks || [],
  });

  table(doc, {
    title: "Referrers and Countries",
    columns: [
      { label: "Source", width: 255, render: (row) => row.referrer || row.country || "Direct", bold: true },
      { label: "Type", width: 116, render: (row) => (row.country ? "Country" : "Referrer") },
      { label: "Visits", width: 140, render: (row) => formatNumber(row.count) },
    ],
    rows: [
      ...(report.traffic.topReferrers || []),
      ...(report.traffic.topCountries || []),
    ],
  });

  table(doc, {
    title: "Booking Breakdown",
    columns: [
      { label: "Service", width: 330, render: (row) => row.label || row.serviceType || "-", bold: true },
      { label: "Bookings", width: 181, render: (row) => formatNumber(row.bookings) },
    ],
    rows: report.bookings.serviceBreakdown || [],
  });

  table(doc, {
    title: "API and Infrastructure",
    columns: [
      { label: "Route", width: 274, key: "path", bold: true },
      { label: "Requests", width: 84, render: (row) => formatNumber(row.requests) },
      { label: "Avg", width: 76, render: (row) => `${Math.round(row.avgDurationMs || 0)} ms` },
      { label: "Max", width: 77, render: (row) => `${Math.round(row.maxDurationMs || 0)} ms` },
    ],
    rows: report.api.topSlowRoutes || [],
  });
});

const generateWarningPdf = (warning) => collectPdf((doc) => {
  coverHeader(doc, {
    title: "Tithi Packers -- Warning",
    eyebrow: "CRITICAL OPERATIONS ALERT",
    subtitle: "A problem needs attention before it affects bookings or customer experience.",
    mode: "warning",
  });

  pill(doc, String(warning.severity || "warning"), 432, 154, {
    fill: COLORS.redSoft,
    color: COLORS.redDark,
    width: 108,
  });

  callout(doc, {
    title: warning.title || "Infrastructure warning",
    body: warning.message || "A monitored system crossed the configured safety threshold.",
    tone: "danger",
  });

  sectionTitle(doc, "Current Signals", "Live values captured when the warning was generated.");
  kpiCards(doc, [
    { label: "API Failures", value: formatNumber(warning.stats?.apiFailures || 0), accent: COLORS.red },
    { label: "Slow APIs", value: formatNumber(warning.stats?.slowApis || 0), accent: COLORS.amber },
    { label: "Traffic 15 Min", value: formatNumber(warning.stats?.traffic15m || 0), accent: COLORS.blue },
    { label: "Mongo", value: warning.stats?.mongoStatus || "unknown", valueSize: 14, accent: warning.stats?.mongoStatus === "connected" ? COLORS.brand : COLORS.red },
    { label: "Redis", value: warning.stats?.redisStatus || "unknown", valueSize: 14, accent: warning.stats?.redisStatus === "connected" ? COLORS.brand : COLORS.red },
    { label: "Severity", value: warning.severity || "warning", valueSize: 14, accent: COLORS.redDark },
  ]);

  table(doc, {
    title: "Recommended Action Plan",
    columns: [
      { label: "#", width: 42, render: (_row, index) => index + 1, bold: true },
      { label: "Action", width: 469, render: (row) => row.action, bold: true },
    ],
    rows: (warning.actions || []).map((action) => ({ action })),
    empty: "No manual action has been configured for this alert.",
    maxRows: 12,
  });

  callout(doc, {
    title: "Delivery note",
    body: "This alert is automatically sent to the same admin email recipients used for booking create and booking update notifications.",
    tone: "info",
  });
});

module.exports = {
  generateMonthlyReportPdf,
  generateWarningPdf,
};
