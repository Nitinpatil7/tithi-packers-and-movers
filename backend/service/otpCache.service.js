const ApiError = require("../utility/apierror");
const { getRedisClient } = require("../config/redis");

const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS || 5 * 60);
const OTP_COOLDOWN_SECONDS = Number(process.env.OTP_COOLDOWN_SECONDS || 120);

const cleanMobile = (mobile) => String(mobile || "").replace(/\D/g, "");

const otpKey = (purpose, mobile) => `otp:${purpose}:${cleanMobile(mobile)}`;
const cooldownKey = (purpose, mobile) => `otp-cooldown:${purpose}:${cleanMobile(mobile)}`;

const getClient = async () => {
  try {
    return await getRedisClient();
  } catch (error) {
    throw new ApiError(503, "Redis OTP cache is unavailable");
  }
};

const getCooldownTtl = async ({ mobile, purpose }) => {
  const redis = await getClient();
  return redis.ttl(cooldownKey(purpose, mobile));
};

const storeOtp = async ({ mobile, purpose, otpRecordId, otpHash, maxAttempts }) => {
  const redis = await getClient();
  const payload = JSON.stringify({
    otpRecordId: String(otpRecordId),
    otpHash,
    attempts: 0,
    maxAttempts,
    createdAt: new Date().toISOString(),
  });

  await redis
    .multi()
    .set(otpKey(purpose, mobile), payload, "EX", OTP_TTL_SECONDS)
    .set(cooldownKey(purpose, mobile), "1", "EX", OTP_COOLDOWN_SECONDS)
    .exec();
};

const getOtp = async ({ mobile, purpose }) => {
  const redis = await getClient();
  const raw = await redis.get(otpKey(purpose, mobile));
  return raw ? JSON.parse(raw) : null;
};

const updateAttempts = async ({ mobile, purpose, otpState }) => {
  const redis = await getClient();
  const ttl = await redis.ttl(otpKey(purpose, mobile));
  if (ttl <= 0) return;
  await redis.set(otpKey(purpose, mobile), JSON.stringify(otpState), "EX", ttl);
};

const deleteOtp = async ({ mobile, purpose }) => {
  const redis = await getClient();
  await redis.del(otpKey(purpose, mobile));
};

const deleteOtpAndCooldown = async ({ mobile, purpose }) => {
  const redis = await getClient();
  await redis.del(otpKey(purpose, mobile), cooldownKey(purpose, mobile));
};

module.exports = {
  OTP_TTL_SECONDS,
  OTP_COOLDOWN_SECONDS,
  getCooldownTtl,
  storeOtp,
  getOtp,
  updateAttempts,
  deleteOtp,
  deleteOtpAndCooldown,
};
