const { getRedisClient } = require("../config/redis");
const logger = require("./logger");

const PUBLIC_CACHE_TTL_SECONDS = 300;
const PUBLIC_CACHE_PREFIX = "public";

const stableValue = (value) => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = stableValue(value[key]);
      return result;
    }, {});
  }
  return value;
};

const cacheKey = (namespace, params = {}) =>
  `${PUBLIC_CACHE_PREFIX}:${namespace}:${JSON.stringify(stableValue(params || {}))}`;

const getCached = async (key) => {
  try {
    const redis = await getRedisClient();
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : undefined;
  } catch (error) {
    logger.warn("Public cache read skipped", { key, error: error.message });
    return undefined;
  }
};

const setCached = async (key, value, ttlSeconds = PUBLIC_CACHE_TTL_SECONDS) => {
  try {
    const redis = await getRedisClient();
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    logger.warn("Public cache write skipped", { key, error: error.message });
  }
};

const withPublicCache = async (namespace, params, loader) => {
  const key = cacheKey(namespace, params);
  const cached = await getCached(key);
  if (cached !== undefined) return cached;
  const data = await loader();
  if (data !== undefined && data !== null) await setCached(key, data);
  return data;
};

const invalidatePublicCache = async (namespace) => {
  const pattern = `${PUBLIC_CACHE_PREFIX}:${namespace}:*`;
  try {
    const redis = await getRedisClient();
    const keys = [];
    const stream = redis.scanStream({ match: pattern, count: 100 });
    await new Promise((resolve, reject) => {
      stream.on("data", (batch = []) => keys.push(...batch));
      stream.on("end", resolve);
      stream.on("error", reject);
    });
    if (keys.length) await redis.del(...keys);
  } catch (error) {
    logger.warn("Public cache invalidation skipped", { namespace, error: error.message });
  }
};

module.exports = {
  PUBLIC_CACHE_TTL_SECONDS,
  withPublicCache,
  invalidatePublicCache,
};
