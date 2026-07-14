const mongoose = require("mongoose");
const { Server } = require("socket.io");

const CHECK_INTERVAL_MS = 1000;

const endpoints = [
  {
    group: "Core",
    name: "API Root",
    method: "GET",
    path: "/",
    public: true,
    target: "server",
  },
  {
    group: "Core",
    name: "Health + Database",
    method: "GET",
    path: "/api/v1/health",
    public: true,
    target: "server",
  },
  {
    group: "Website",
    name: "Site Settings",
    method: "GET",
    path: "/api/site-setting",
    public: true,
    target: "content",
  },
  {
    group: "Website",
    name: "Branches",
    method: "GET",
    path: "/api/branch",
    public: true,
    target: "content",
  },
  {
    group: "Website",
    name: "FAQs",
    method: "GET",
    path: "/api/faq",
    public: true,
    target: "content",
  },
  {
    group: "Website",
    name: "Testimonials",
    method: "GET",
    path: "/api/testimonial",
    public: true,
    target: "content",
  },
  {
    group: "Booking",
    name: "Item Catalog",
    method: "GET",
    path: "/api/items/catalog",
    public: true,
    target: "catalog",
  },
  {
    group: "Booking",
    name: "Add-ons",
    method: "GET",
    path: "/api/addon/available?serviceType=local_shifting",
    public: true,
    target: "catalog",
  },
  {
    group: "Booking",
    name: "Pricing Rules",
    method: "GET",
    path: "/api/booking-pricing-rules",
    public: true,
    target: "pricing",
  },
  {
    group: "Tracking",
    name: "Booking Tracking Probe",
    method: "GET",
    path: "/api/bookings/track?mobile=9876543210",
    public: true,
    target: "booking",
  },
  {
    group: "Admin",
    name: "Admin Analytics",
    method: "GET",
    path: "/api/admin-analytics/dashboard",
    protected: true,
    target: "admin",
  },
  {
    group: "Admin",
    name: "Admin Bookings",
    method: "GET",
    path: "/api/bookings/admin/all",
    protected: true,
    target: "admin",
  },
  {
    group: "Admin",
    name: "In-app Notifications",
    method: "GET",
    path: "/api/in-app-notifications/summary",
    protected: true,
    target: "admin",
  },
];

const asApiUrl = (baseUrl, path) =>
  path === "/" ? baseUrl : `${baseUrl}${path}`;

const checkEndpoint = async (baseUrl, endpoint) => {
  const started = performance.now();
  const url = asApiUrl(baseUrl, endpoint.path);
  try {
    const response = await fetch(url, {
      method: endpoint.method,
      headers: { Accept: "application/json" },
    });
    const duration = Math.round(performance.now() - started);
    const payload = await response.json().catch(() => ({}));
    const expectedProtected =
      endpoint.protected && [401, 403].includes(response.status);

    return {
      ...endpoint,
      url,
      ok: response.ok || expectedProtected,
      expectedProtected,
      status: response.status,
      statusText: response.statusText,
      duration,
      message:
        payload.message ||
        payload.error ||
        (expectedProtected
          ? "Protected endpoint requires admin login."
          : response.statusText),
      payload,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ...endpoint,
      url,
      ok: false,
      status: 0,
      duration: Math.round(performance.now() - started),
      message: error?.message || "Failed to fetch",
      hint: "Server down, wrong backend URL, internal API failure, or network issue.",
      checkedAt: new Date().toISOString(),
    };
  }
};

const buildSnapshot = async (port) => {
  const baseUrl = process.env.MONITORING_SELF_URL || `http://127.0.0.1:${port}`;
  const results = await Promise.all(
    endpoints.map((endpoint) => checkEndpoint(baseUrl, endpoint)),
  );
  const failed = results.filter(
    (item) => !item.ok && !item.expectedProtected,
  ).length;
  const protectedCount = results.filter(
    (item) => item.expectedProtected,
  ).length;
  const slowest =
    [...results].sort((a, b) => (b.duration || 0) - (a.duration || 0))[0] ||
    null;
  const averageTiming = results.length
    ? Math.round(
        results.reduce((sum, item) => sum + (item.duration || 0), 0) /
          results.length,
      )
    : 0;

  return {
    generatedAt: new Date().toISOString(),
    intervalMs: CHECK_INTERVAL_MS,
    baseUrl,
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node: process.version,
      environment: process.env.NODE_ENV || "development",
    },
    summary: {
      checked: results.length,
      failed,
      protectedCount,
      healthy: results.length - failed,
      averageTiming,
      slowest,
    },
    results,
  };
};

const attachMonitoringSocket = (httpServer, app, port) => {
  const io = new Server(httpServer, {
    cors: {
      origin: app.get("allowedOrigins") || [],
      credentials: true,
    },
  });

  const namespace = io.of("/monitoring");
  let latestSnapshot = null;

  const emitSnapshot = async () => {
    latestSnapshot = await buildSnapshot(port);
    namespace.emit("monitoring:snapshot", latestSnapshot);
  };

  namespace.on("connection", (socket) => {
    socket.emit("monitoring:connected", {
      message: "Monitoring socket connected",
      intervalMs: CHECK_INTERVAL_MS,
      generatedAt: new Date().toISOString(),
    });

    if (latestSnapshot) socket.emit("monitoring:snapshot", latestSnapshot);
    else
      emitSnapshot().catch((error) =>
        socket.emit("monitoring:error", { message: error.message }),
      );

    socket.on("monitoring:run", () => {
      emitSnapshot().catch((error) =>
        socket.emit("monitoring:error", { message: error.message }),
      );
    });
  });

  setInterval(() => {
    emitSnapshot().catch((error) => {
      namespace.emit("monitoring:error", {
        message: error.message,
        generatedAt: new Date().toISOString(),
      });
    });
  }, CHECK_INTERVAL_MS);
};

module.exports = attachMonitoringSocket;
