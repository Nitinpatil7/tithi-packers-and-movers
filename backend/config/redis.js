const IORedis = require("ioredis");
const logger = require("../utility/logger");

let redisClient;

const getRedisUrl = () => process.env.REDIS_URL || "redis://127.0.0.1:6379";

const createRedisClient = () => {
  const client = new IORedis(getRedisUrl(), {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    retryStrategy(times) {
      return Math.min(times * 100, 2000);
    },
  });

  client.on("error", (error) => {
    logger.error("Redis connection error", { error: error.message });
  });

  return client;
};

const getRedisClient = async () => {
  if (!redisClient) redisClient = createRedisClient();
  if (redisClient.status === "end") redisClient = createRedisClient();
  if (redisClient.status === "wait") await redisClient.connect();
  return redisClient;
};

const getBullMqRedisOptions = () => ({
  connection: new IORedis(getRedisUrl(), {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }),
});

module.exports = {
  getRedisClient,
  getBullMqRedisOptions,
  getRedisUrl,
};
