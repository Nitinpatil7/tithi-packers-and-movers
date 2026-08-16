"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CircleDot,
  Clock3,
  Database,
  FileText,
  Globe2,
  Gauge,
  HardDrive,
  History,
  Network,
  RefreshCw,
  Server,
  ShieldAlert,
  TimerReset,
  TrendingUp,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const SOCKET_URL = API_URL || undefined;
const TRACKING_PROBE_MOBILE = (process.env.NEXT_PUBLIC_MONITORING_TRACKING_PROBE_MOBILE || "").replace(/\D/g, "");
const AUTO_REFRESH_MS = 5000;
const HISTORY_STORAGE_KEY = "tithi-monitoring-availability-history";
const LOG_STORAGE_KEY = "tithi-monitoring-event-logs";
const MAX_HISTORY_ITEMS = 96;
const MAX_LOG_ITEMS = 160;

const ENDPOINTS = [
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
  ...(TRACKING_PROBE_MOBILE ? [{
    group: "Tracking",
    name: "Booking Tracking Probe",
    method: "GET",
    path: `/api/bookings/track?mobile=${TRACKING_PROBE_MOBILE}`,
    public: true,
    target: "booking",
  }] : []),
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

function toApiUrl(path) {
  if (!API_URL) return path;
  if (path === "/") return API_URL || "/";
  return `${API_URL}${path}`;
}

function formatBytes(bytes = 0) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function statusTone(result) {
  if (!result) return "border-slate-800 bg-slate-950/80 text-slate-400";
  if (result.ok && !result.expectedProtected)
    return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,0.08)]";
  if (result.expectedProtected)
    return "border-amber-400/40 bg-amber-400/10 text-amber-200 shadow-[0_0_24px_rgba(245,158,11,0.08)]";
  return "border-red-400/50 bg-red-500/10 text-red-200 shadow-[0_0_28px_rgba(239,68,68,0.12)]";
}

function statusIcon(result) {
  if (!result) return Clock3;
  if (result.ok && !result.expectedProtected) return CheckCircle2;
  if (result.expectedProtected) return ShieldAlert;
  return XCircle;
}

function classifySpeed(duration) {
  if (!duration && duration !== 0)
    return { label: "WAIT", color: "bg-slate-700", text: "text-slate-500" };
  if (duration < 250)
    return { label: "FAST", color: "bg-emerald-400", text: "text-emerald-300" };
  if (duration < 800)
    return { label: "NORMAL", color: "bg-cyan-400", text: "text-cyan-300" };
  if (duration < 1500)
    return { label: "SLOW", color: "bg-amber-400", text: "text-amber-300" };
  return { label: "CRITICAL", color: "bg-red-500", text: "text-red-300" };
}

function readStoredJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Monitoring must keep running even if browser storage is blocked.
  }
}

function endpointHealthy(result) {
  return Boolean(result?.ok || result?.expectedProtected);
}

function formatDuration(totalSeconds = 0) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
}

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function buildAvailabilityRecord(results, generatedAt, source, payload) {
  const checked = results.length;
  const failed = results.filter((item) => !endpointHealthy(item)).length;
  const healthy = checked - failed;
  const averageTiming = checked
    ? Math.round(
        results.reduce((sum, item) => sum + (item.duration || 0), 0) / checked,
      )
    : 0;

  return {
    id: `${generatedAt}-${source}`,
    generatedAt,
    source,
    checked,
    healthy,
    failed,
    availability: checked ? Math.round((healthy / checked) * 10000) / 100 : 0,
    database: payload?.database || "unknown",
    redis: payload?.redis?.status || "unknown",
    socket: source === "socket" ? "connected" : "fallback",
    averageTiming,
    slowest:
      [...results].sort((a, b) => (b.duration || 0) - (a.duration || 0))[0] ||
      null,
    results,
  };
}

function buildMonitorLogs(previousResults = [], nextResults = [], generatedAt, source) {
  const previousMap = new Map(previousResults.map((item) => [item.path, item]));
  const logs = [];

  nextResults.forEach((result) => {
    const previous = previousMap.get(result.path);
    const wasHealthy = previous ? endpointHealthy(previous) : null;
    const isHealthy = endpointHealthy(result);

    if (wasHealthy === null) {
      logs.push({
        id: `${generatedAt}-${result.path}-initial`,
        type: isHealthy ? "recovered" : "failed",
        title: isHealthy ? `${result.name} reachable` : `${result.name} failed`,
        detail: `${result.method} ${result.path} returned HTTP ${result.status} in ${result.duration} ms.`,
        generatedAt,
        source,
      });
      return;
    }

    if (wasHealthy !== isHealthy) {
      logs.push({
        id: `${generatedAt}-${result.path}-${isHealthy ? "recovered" : "failed"}`,
        type: isHealthy ? "recovered" : "failed",
        title: isHealthy ? `${result.name} recovered` : `${result.name} went down`,
        detail: `${result.message || result.statusText || "Status changed"} | HTTP ${result.status} | ${result.duration} ms`,
        generatedAt,
        source,
      });
      return;
    }

    if (isHealthy && result.duration > 1500 && (!previous || previous.duration <= 1500)) {
      logs.push({
        id: `${generatedAt}-${result.path}-slow`,
        type: "slow",
        title: `${result.name} became slow`,
        detail: `${result.duration} ms response time. Check database/API pressure if this repeats.`,
        generatedAt,
        source,
      });
    }
  });

  return logs;
}

function calculateAvailabilityStats(history) {
  const totalSnapshots = history.length;
  const totalChecks = history.reduce((sum, item) => sum + item.checked, 0);
  const failedChecks = history.reduce((sum, item) => sum + item.failed, 0);
  const availability = totalChecks
    ? Math.round(((totalChecks - failedChecks) / totalChecks) * 10000) / 100
    : 0;
  const downtimeSnapshots = history.filter((item) => item.failed > 0).length;
  const intervalSeconds = AUTO_REFRESH_MS / 1000;

  return {
    totalSnapshots,
    totalChecks,
    failedChecks,
    availability,
    downtime: formatDuration(downtimeSnapshots * intervalSeconds),
    working: formatDuration(
      Math.max(totalSnapshots - downtimeSnapshots, 0) * intervalSeconds,
    ),
    currentStreak: formatDuration(
      history.findIndex((item) => item.failed > 0) === -1
        ? totalSnapshots * intervalSeconds
        : history.findIndex((item) => item.failed > 0) * intervalSeconds,
    ),
  };
}

async function checkEndpoint(endpoint) {
  const started = performance.now();
  const url = toApiUrl(endpoint.path);
  try {
    const response = await fetch(url, {
      method: endpoint.method,
      credentials: "include",
      cache: "no-store",
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
      hint: "Server down, wrong NEXT_PUBLIC_API_URL, blocked CORS origin, mixed HTTP/HTTPS, or network/DNS issue.",
      checkedAt: new Date().toISOString(),
    };
  }
}

async function checkEndpointsInBatches(batchSize = 4, onBatch) {
  const checks = [];
  for (let index = 0; index < ENDPOINTS.length; index += batchSize) {
    const batch = ENDPOINTS.slice(index, index + batchSize);
    const batchResults = await Promise.all(batch.map(checkEndpoint));
    checks.push(...batchResults);
    onBatch?.([...checks]);
  }
  return checks;
}

export default function MonitoringPage() {
  const [results, setResults] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const [availabilityHistory, setAvailabilityHistory] = useState(() =>
    readStoredJson(HISTORY_STORAGE_KEY, []),
  );
  const [eventLogs, setEventLogs] = useState(() =>
    readStoredJson(LOG_STORAGE_KEY, []),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [socketState, setSocketState] = useState("connecting");
  const [socketMessage, setSocketMessage] = useState(
    "Opening monitoring socket...",
  );
  const [lastRun, setLastRun] = useState("");
  const [socketRef, setSocketRef] = useState(null);
  const latestResultsRef = useRef([]);

  const recordSnapshot = (nextResults, generatedAt, source, payload = {}) => {
    const stableTime = generatedAt || new Date().toISOString();
    const newLogs = buildMonitorLogs(
      latestResultsRef.current,
      nextResults,
      stableTime,
      source,
    );
    latestResultsRef.current = nextResults;

    if (newLogs.length) {
      setEventLogs((previousLogs) => {
        const nextLogs = [...newLogs, ...previousLogs].slice(0, MAX_LOG_ITEMS);
        writeStoredJson(LOG_STORAGE_KEY, nextLogs);
        return nextLogs;
      });
    }

    setAvailabilityHistory((previousHistory) => {
      if (previousHistory[0]?.generatedAt === stableTime) return previousHistory;
      const record = buildAvailabilityRecord(
        nextResults,
        stableTime,
        source,
        payload,
      );
      const nextHistory = [record, ...previousHistory].slice(
        0,
        MAX_HISTORY_ITEMS,
      );
      writeStoredJson(HISTORY_STORAGE_KEY, nextHistory);
      return nextHistory;
    });
  };

  useEffect(() => {
    let socket;
    let cancelled = false;

    async function connectSocket() {
      const { io } = await import("socket.io-client");
      if (cancelled) return;
      socket = io(`${SOCKET_URL || ""}/monitoring`, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1200,
        reconnectionAttempts: Infinity,
      });

      setSocketRef(socket);

      socket.on("connect", () => {
        setSocketState("connected");
        setSocketMessage(`Socket live: ${socket.id}`);
      });

      socket.on("disconnect", (reason) => {
        setSocketState("disconnected");
        setSocketMessage(`Socket disconnected: ${reason}`);
      });

      socket.on("connect_error", (error) => {
        setSocketState("error");
        setSocketMessage(error?.message || "Socket connection failed");
      });

      socket.on("monitoring:connected", (payload) => {
        setSocketMessage(payload?.message || "Monitoring socket connected");
      });

      socket.on("monitoring:snapshot", (payload) => {
        const nextResults = payload?.results || [];
        setSnapshot(payload);
        setResults(nextResults);
        recordSnapshot(
          nextResults,
          payload?.generatedAt || new Date().toISOString(),
          "socket",
          payload,
        );
        setLastRun(
          payload?.generatedAt
            ? new Date(payload.generatedAt).toLocaleString()
            : new Date().toLocaleString(),
        );
        setIsRunning(false);
      });

      socket.on("monitoring:error", (payload) => {
        setSocketState("error");
        setSocketMessage(payload?.message || "Monitoring socket error");
        setIsRunning(false);
      });
    }

    connectSocket();

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socketState === "connected" || socketState === "connecting") return undefined;
    let cancelled = false;
    const runFallback = async () => {
      const checks = await checkEndpointsInBatches(4, (partial) => {
        if (!cancelled) setResults(partial);
      });
      if (cancelled) return;
      setResults(checks);
      recordSnapshot(checks, new Date().toISOString(), "browser fallback");
      setLastRun(new Date().toLocaleString());
    };
    runFallback();
    const timer = setInterval(runFallback, AUTO_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [socketState]);

  const resultMap = useMemo(
    () => new Map(results.map((item) => [item.path, item])),
    [results],
  );
  const health = resultMap.get("/api/v1/health")?.payload;
  const server = snapshot?.server;

  const summary = useMemo(() => {
    const checked = results.length;
    const failed = results.filter(
      (item) => !item.ok && !item.expectedProtected,
    ).length;
    const protectedCount = results.filter(
      (item) => item.expectedProtected,
    ).length;
    const slowest = [...results].sort(
      (a, b) => (b.duration || 0) - (a.duration || 0),
    )[0];
    const avg =
      snapshot?.summary?.averageTiming ??
      (checked
        ? Math.round(
            results.reduce((sum, item) => sum + (item.duration || 0), 0) /
              checked,
          )
        : 0);
    return { checked, failed, protectedCount, slowest, avg };
  }, [results, snapshot]);

  const grouped = useMemo(() => {
    return ENDPOINTS.reduce((acc, endpoint) => {
      acc[endpoint.group] ||= [];
      acc[endpoint.group].push(endpoint);
      return acc;
    }, {});
  }, []);

  const runChecks = async () => {
    setIsRunning(true);
    if (socketRef?.connected) {
      socketRef.emit("monitoring:run");
      return;
    }
    const checks = await checkEndpointsInBatches(4, setResults);
    setResults(checks);
    recordSnapshot(checks, new Date().toISOString(), "manual browser check");
    setLastRun(new Date().toLocaleString());
    setIsRunning(false);
  };

  const socketHealthy = socketState === "connected";
  const dbStatus = snapshot?.database || health?.database || "unknown";
  const redisStatus = snapshot?.redis?.status || "unknown";
  const redisHealthy = snapshot?.redis?.ok || redisStatus === "connected";
  const availabilityStats = useMemo(
    () => calculateAvailabilityStats(availabilityHistory),
    [availabilityHistory],
  );
  const currentAvailability =
    availabilityHistory[0]?.availability ??
    (summary.checked
      ? Math.round(
          ((summary.checked - summary.failed) / summary.checked) * 10000,
        ) / 100
      : 0);

  return (
    <main className="relative min-h-screen  overflow-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-60    [background-image:linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.22),transparent_58%)]" />
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-cyan-300/40 shadow-[0_0_32px_rgba(34,211,238,0.8)]" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-cyan-400/10" />

      <section className="relative border-b border-cyan-300/15 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 pt-28 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.12)]">
                <Activity className="h-3.5 w-3.5" />
                Live Ops Console
              </div>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">
                Monitoring Command Center
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                Socket.IO updates every 5 seconds with endpoint health, average
                latency, database state, server memory, and protected route
                reachability.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <SocketBadge state={socketState} message={socketMessage} />
              <span className="font-mono text-xs font-semibold text-slate-400">
                {lastRun
                  ? `LAST SNAPSHOT ${lastRun}`
                  : "AWAITING FIRST SNAPSHOT"}
              </span>
              <button
                type="button"
                onClick={runChecks}
                disabled={isRunning}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-cyan-300/40 bg-cyan-300 px-4 py-2.5 text-sm font-black text-slate-950 shadow-[0_0_34px_rgba(34,211,238,0.22)] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-70"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`}
                />
                {isRunning ? "SYNCING" : "FORCE SYNC"}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <Metric
              icon={Server}
              label="Backend Origin"
              value={API_URL || "Same origin"}
              tone="cyan"
            />
            <Metric
              icon={socketHealthy ? Wifi : WifiOff}
              label="Socket"
              value={socketHealthy ? "Connected" : socketState}
              tone={socketHealthy ? "emerald" : "red"}
            />
            <Metric
              icon={Database}
              label="Database"
              value={dbStatus}
              tone={dbStatus === "connected" ? "emerald" : "amber"}
            />
            <Metric
              icon={HardDrive}
              label="Redis"
              value={redisStatus}
              tone={redisHealthy ? "emerald" : "red"}
            />
            <Metric
              icon={Gauge}
              label="Average Timing"
              value={summary.checked ? `${summary.avg} ms` : "Pending"}
              tone="sky"
            />
            <Metric
              icon={AlertTriangle}
              label="Failures"
              value={`${summary.failed} failed`}
              tone={summary.failed ? "red" : "emerald"}
            />
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Panel title="Server Health" icon={Server}>
              <HealthRow
                label="Uptime"
                value={
                  server?.uptime
                    ? `${Math.round(server.uptime)} sec`
                    : health?.uptime
                      ? `${Math.round(health.uptime)} sec`
                      : "Pending"
                }
              />
              <HealthRow
                label="Environment"
                value={server?.environment || "Unknown"}
              />
              <HealthRow label="Node" value={server?.node || "Unknown"} />
              <HealthRow
                label="Heap Used"
                value={formatBytes(
                  server?.memory?.heapUsed ?? health?.memory?.heapused,
                )}
              />
            </Panel>

            <Panel title="Traffic" icon={Network}>
              <HealthRow
                label="Synthetic probes"
                value={
                  summary.checked ? `${summary.checked} endpoints` : "Pending"
                }
              />
              <HealthRow
                label="Refresh cycle"
                value={`${AUTO_REFRESH_MS / 1000} sec`}
              />
              <HealthRow
                label="Protected checks"
                value={`${summary.protectedCount} expected auth`}
              />
              <HealthRow label="Real traffic" value="Connect hosting logs" />
            </Panel>

            <Panel title="Scaling" icon={HardDrive}>
              <HealthRow
                label="API pressure"
                value={
                  summary.avg > 800
                    ? "Review slow APIs"
                    : summary.checked
                      ? "Normal"
                      : "Pending"
                }
              />
              <HealthRow
                label="Slowest API"
                value={summary.slowest?.name || "Pending"}
              />
              <HealthRow
                label="Slowest timing"
                value={summary.slowest ? `${summary.slowest.duration} ms` : "-"}
              />
              <HealthRow label="DB link" value={dbStatus} />
              <HealthRow label="Redis link" value={redisStatus} />
              <HealthRow
                label="Redis ping"
                value={
                  snapshot?.redis?.duration !== undefined
                    ? `${snapshot.redis.duration} ms`
                    : "Pending"
                }
              />
            </Panel>
          </div>

          <section className="rounded-xl border border-cyan-300/15 bg-slate-950/80 shadow-[0_0_42px_rgba(8,145,178,0.08)]">
            <div className="flex flex-col gap-3 border-b border-cyan-300/15 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-300" />
                <h2 className="font-black text-white">Availability Monitor</h2>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-400">
                {availabilityStats.totalSnapshots
                  ? `${availabilityStats.totalSnapshots} snapshots saved in this browser`
                  : "Waiting for availability history"}
              </span>
            </div>
            <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
              <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-emerald-200">
                  Current Availability
                </p>
                <p className="mt-2 font-mono text-4xl font-black text-white">
                  {currentAvailability.toFixed(2)}%
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900 ring-1 ring-white/10">
                  <div
                    className={`h-full rounded-full ${
                      currentAvailability >= 99
                        ? "bg-emerald-400"
                        : currentAvailability >= 95
                          ? "bg-amber-400"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(currentAvailability, 100)}%` }}
                  />
                </div>
                <div className="mt-4 grid gap-2">
                  <HealthRow label="Working time" value={availabilityStats.working} />
                  <HealthRow label="Failed time" value={availabilityStats.downtime} />
                  <HealthRow
                    label="Healthy streak"
                    value={availabilityStats.currentStreak}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-3 grid gap-3 sm:grid-cols-3">
                  <MiniMetric
                    label="Total checks"
                    value={availabilityStats.totalChecks || summary.checked}
                    tone="cyan"
                  />
                  <MiniMetric
                    label="Failed checks"
                    value={availabilityStats.failedChecks || summary.failed}
                    tone={availabilityStats.failedChecks || summary.failed ? "red" : "emerald"}
                  />
                  <MiniMetric
                    label="Avg latency"
                    value={`${availabilityHistory[0]?.averageTiming ?? summary.avg} ms`}
                    tone="sky"
                  />
                </div>
                <div className="grid grid-cols-12 gap-1">
                  {availabilityHistory.slice(0, 48).map((item) => (
                    <div
                      key={item.id}
                      title={`${formatTime(item.generatedAt)} | ${item.availability}% | ${item.failed} failed`}
                      className={`h-8 rounded border ${
                        item.failed
                          ? "border-red-300/30 bg-red-500/70"
                          : "border-emerald-300/30 bg-emerald-400/70"
                      }`}
                    />
                  ))}
                  {!availabilityHistory.length &&
                    Array.from({ length: 24 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-8 rounded border border-slate-700 bg-slate-900"
                      />
                    ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                    Working snapshot
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
                    Failed snapshot
                  </span>
                  <span className="font-mono">
                    Latest: {formatTime(availabilityHistory[0]?.generatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-cyan-300/15 bg-slate-950/80 shadow-[0_0_42px_rgba(8,145,178,0.08)]">
            <div className="flex items-center justify-between border-b border-cyan-300/15 px-4 py-3">
              <div className="flex items-center gap-2">
                <TimerReset className="h-5 w-5 text-cyan-300" />
                <h2 className="font-black text-white">API Response Timing</h2>
              </div>
              <span className="font-mono text-xs font-semibold text-cyan-200">
                AUTO REFRESH / 5S
              </span>
            </div>
            <div className="divide-y divide-cyan-300/10">
              {ENDPOINTS.map((endpoint) => {
                const result = resultMap.get(endpoint.path);
                const speed = classifySpeed(result?.duration);
                const width = Math.min(
                  100,
                  Math.max(6, ((result?.duration || 0) / 1600) * 100),
                );
                return (
                  <div
                    key={endpoint.path}
                    className="grid gap-3 px-4 py-3 lg:grid-cols-[240px_1fr_130px] lg:items-center"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">
                        {endpoint.name}
                      </p>
                      <p className="mt-0.5 break-all font-mono text-xs font-semibold text-slate-500">
                        {endpoint.method} {endpoint.path}
                      </p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-900 ring-1 ring-cyan-300/10">
                      <div
                        className={`h-full rounded-full ${speed.color} shadow-[0_0_18px_currentColor]`}
                        style={{ width: result ? `${width}%` : "0%" }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 lg:justify-end">
                      <span
                        className={`font-mono text-xs font-black ${speed.text}`}
                      >
                        {speed.label}
                      </span>
                      <span className="font-mono text-sm font-black text-slate-100">
                        {result ? `${result.duration} ms` : "-"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {Object.entries(grouped).map(([group, endpoints]) => (
            <section
              key={group}
              className="rounded-xl border border-cyan-300/15 bg-slate-950/80 shadow-[0_0_42px_rgba(8,145,178,0.07)]"
            >
              <div className="border-b border-cyan-300/15 px-4 py-3">
                <h2 className="font-black text-white">{group} APIs</h2>
              </div>
              <div className="grid gap-3 p-4">
                {endpoints.map((endpoint) => {
                  const result = resultMap.get(endpoint.path);
                  const Icon = statusIcon(result);
                  return (
                    <article
                      key={endpoint.path}
                      className={`rounded-lg border p-4 ${statusTone(result)}`}
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 shrink-0" />
                            <h3 className="truncate text-sm font-black">
                              {endpoint.name}
                            </h3>
                            {endpoint.protected && (
                              <span className="rounded bg-black/25 px-2 py-0.5 text-[10px] font-black uppercase">
                                Auth
                              </span>
                            )}
                          </div>
                          <p className="mt-1 break-all font-mono text-xs font-semibold opacity-80">
                            {endpoint.method} {toApiUrl(endpoint.path)}
                          </p>
                          {result?.message && (
                            <p className="mt-2 text-xs font-semibold opacity-90">
                              {result.message}
                            </p>
                          )}
                          {result?.hint && (
                            <p className="mt-1 text-xs font-semibold opacity-75">
                              {result.hint}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2 font-mono text-xs font-black">
                          <span>
                            {result ? `HTTP ${result.status}` : "PENDING"}
                          </span>
                          <span>{result ? `${result.duration} ms` : "-"}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-6">
          <Panel title="Live Logs" icon={FileText}>
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {eventLogs.length ? (
                eventLogs.slice(0, 18).map((log) => (
                  <LogItem key={log.id} log={log} />
                ))
              ) : (
                <Diagnostic
                  label="No events yet"
                  value="Logs appear here when an API fails, recovers, or becomes critically slow."
                />
              )}
            </div>
          </Panel>

          <Panel title="Last Failure" icon={History}>
            {(() => {
              const lastFailed = availabilityHistory.find((item) => item.failed > 0);
              if (!lastFailed) {
                return (
                  <Diagnostic
                    label="No failure recorded"
                    value="Current browser history has only healthy availability snapshots."
                  />
                );
              }
              const failedEndpoints = lastFailed.results
                .filter((item) => !endpointHealthy(item))
                .map((item) => item.name)
                .join(", ");
              return (
                <>
                  <HealthRow label="Time" value={formatTime(lastFailed.generatedAt)} />
                  <HealthRow label="Failed APIs" value={`${lastFailed.failed}`} />
                  <Diagnostic
                    label="What failed"
                    value={failedEndpoints || "Failure details unavailable."}
                  />
                  <Diagnostic
                    label="Likely reason"
                    value={
                      lastFailed.database === "disconnected"
                        ? "Database disconnected or backend could not reach MongoDB."
                        : "Endpoint returned an error, timed out, or browser could not reach backend."
                    }
                  />
                </>
              );
            })()}
          </Panel>

          <Panel title="Failure Diagnosis" icon={ShieldAlert}>
            <Diagnostic
              label="Failed to fetch"
              value="Backend down, wrong domain, CORS blocked, HTTP/HTTPS mismatch, or DNS issue."
            />
            <Diagnostic
              label="401 / 403"
              value="Reachable and protected. Login/session is required."
            />
            <Diagnostic
              label="404"
              value="Wrong route path or route not mounted in backend."
            />
            <Diagnostic
              label="500"
              value="Backend code/database error. Check backend terminal logs."
            />
          </Panel>

          <Panel title="Fixed Probes" icon={CheckCircle2}>
            <HealthRow label="Add-ons" value="/api/addon/available" />
            <HealthRow label="Booking tracking" value={TRACKING_PROBE_MOBILE ? "Configured probe" : "Disabled until probe mobile is configured"} />
            <HealthRow label="Admin APIs" value="401/403 accepted" />
            <HealthRow label="Socket channel" value="/monitoring" />
          </Panel>

          <Panel title="Domain Setup" icon={Globe2}>
            <HealthRow label="Website" value="Public domain" />
            <HealthRow label="Admin" value="Admin domain" />
            <HealthRow label="Monitoring" value="Monitor domain" />
            <HealthRow label="Backend CORS" value="Set CLIENT_URLS" />
          </Panel>

          <Panel title="Observability Plan" icon={BarChart3}>
            <Diagnostic
              label="Now"
              value="Socket snapshots, synthetic probes, timing, DB status, memory, uptime."
            />
            <Diagnostic
              label="Next"
              value="Add request counters, p95 timings, and persistent log history."
            />
            <Diagnostic
              label="Production"
              value="Connect hosting logs, uptime monitor, error tracking, and alerts."
            />
          </Panel>
        </aside>
      </section>
    </main>
  );
}

function SocketBadge({ state, message }) {
  const connected = state === "connected";
  return (
    <div
      className={`inline-flex max-w-full items-center gap-2 rounded-md border px-3 py-2 font-mono text-xs font-black uppercase ${connected ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-200" : "border-red-300/40 bg-red-500/10 text-red-200"}`}
    >
      {connected ? (
        <Wifi className="h-4 w-4" />
      ) : (
        <WifiOff className="h-4 w-4" />
      )}
      <span className="truncate">{message}</span>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  const tones = {
    cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-200",
    sky: "border-sky-300/25 bg-sky-300/10 text-sky-200",
    emerald: "border-emerald-300/25 bg-emerald-300/10 text-emerald-200",
    amber: "border-amber-300/25 bg-amber-300/10 text-amber-200",
    red: "border-red-300/25 bg-red-400/10 text-red-200",
  };
  return (
    <div
      className={`rounded-xl border p-4 shadow-[0_0_32px_rgba(15,23,42,0.35)] ${tones[tone] || tones.cyan}`}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-black/30 ring-1 ring-white/10">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">
            {label}
          </p>
          <p className="truncate text-lg font-black text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value, tone }) {
  const tones = {
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
    sky: "border-sky-300/20 bg-sky-300/10 text-sky-200",
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    red: "border-red-300/20 bg-red-400/10 text-red-200",
  };
  return (
    <div className={`rounded-lg border p-3 ${tones[tone] || tones.cyan}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-80">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-lg font-black text-white">
        {value}
      </p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-cyan-300/15 bg-slate-950/80 p-4 shadow-[0_0_42px_rgba(8,145,178,0.08)]">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-cyan-300" />
        <h2 className="font-black text-white">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function LogItem({ log }) {
  const tone =
    log.type === "failed"
      ? "text-red-300"
      : log.type === "slow"
        ? "text-amber-300"
        : "text-emerald-300";

  return (
    <div className="border-b border-cyan-300/10 pb-3 last:border-0 last:pb-0">
      <div className="flex items-start gap-2">
        <CircleDot className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-xs font-black text-slate-100">{log.title}</p>
            <span className="font-mono text-[10px] font-bold uppercase text-slate-500">
              {formatTime(log.generatedAt)}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
            {log.detail}
          </p>
        </div>
      </div>
    </div>
  );
}

function HealthRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-cyan-300/10 pb-2 last:border-0 last:pb-0">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <span className="text-right font-mono text-xs font-bold text-slate-100">
        {value}
      </span>
    </div>
  );
}

function Diagnostic({ label, value }) {
  return (
    <div>
      <p className="text-xs font-black text-slate-100">{label}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
        {value}
      </p>
    </div>
  );
}
