const Otp = require("../schema/Otp.model");
const ApiError = require("../utility/apierror");
const { hashOtp, compareOtp } = require("../utility/hashOtp");
const generateOtp = require("../utility/generateOtp");
const sendMessage = require("./messageProvider.service");
const otpCache = require("./otpCache.service");

const OTP_EXPIRY_SECONDS = otpCache.OTP_TTL_SECONDS;
const RESEND_COOLDOWN_SECONDS = otpCache.OTP_COOLDOWN_SECONDS;

const normalizeMobile = (value) => {
  let mobile = String(value || "").replace(/\D/g, "");
  if (mobile.length === 12 && mobile.startsWith("91")) mobile = mobile.slice(2);
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    throw new ApiError(400, "Please provide a valid 10-digit Indian mobile number");
  }
  return mobile;
};

const sendOtp = async ({ mobile: mobileInput, purpose = "booking" }) => {
  const mobile = normalizeMobile(mobileInput);
  const cooldownTtl = await otpCache.getCooldownTtl({ mobile, purpose });

  if (cooldownTtl > 0) {
    throw new ApiError(
      429,
      `Please wait ${cooldownTtl} seconds before requesting another OTP`,
    );
  }

  await Otp.updateMany({ mobile, purpose, isUsed: false }, { $set: { isUsed: true } });

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const otpRecord = await Otp.create({
    mobile,
    purpose,
    otpHash,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000),
    purgeAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await otpCache.storeOtp({
    mobile,
    purpose,
    otpRecordId: otpRecord._id,
    otpHash,
    maxAttempts: otpRecord.maxAttempts,
  });

  const result = await sendMessage({
    channel: "sms",
    mobile,
    otp,
  });

  if (!result.success) {
    await Otp.findByIdAndDelete(otpRecord._id);
    await otpCache.deleteOtpAndCooldown({ mobile, purpose });
    throw new ApiError(503, result.errorMessage || "Unable to send OTP");
  }

  return {
    mobile,
    purpose,
    expiresInSeconds: OTP_EXPIRY_SECONDS,
    resendAfterSeconds: RESEND_COOLDOWN_SECONDS,
    provider: result.provider,
    requestId: result.providerMessageId,
    deliveryCost: result.response?.data?.cost,
  };
};

const verifyOtp = async ({ mobile: mobileInput, otp, purpose = "booking" }) => {
  const mobile = normalizeMobile(mobileInput);
  if (!/^\d{6}$/.test(String(otp || ""))) {
    throw new ApiError(400, "OTP must be a 6-digit number");
  }

  const otpState = await otpCache.getOtp({ mobile, purpose });
  if (!otpState) throw new ApiError(400, "OTP is invalid, expired, or already used");

  const otpRecord = await Otp.findById(otpState.otpRecordId).select("+otpHash");
  if (!otpRecord) throw new ApiError(400, "OTP is invalid or already used");
  if (otpRecord.isUsed || otpRecord.expiresAt <= new Date()) {
    otpRecord.isUsed = true;
    await otpRecord.save();
    await otpCache.deleteOtp({ mobile, purpose });
    throw new ApiError(400, "OTP has expired. Please request a new OTP");
  }
  if (otpState.attempts >= otpState.maxAttempts) {
    otpRecord.isUsed = true;
    await otpRecord.save();
    await otpCache.deleteOtp({ mobile, purpose });
    throw new ApiError(429, "Maximum OTP attempts exceeded. Please request a new OTP");
  }

  const isValid = await compareOtp(String(otp), otpState.otpHash || otpRecord.otpHash);
  if (!isValid) {
    otpState.attempts += 1;
    otpRecord.attempts = otpState.attempts;
    if (otpRecord.attempts >= otpRecord.maxAttempts) otpRecord.isUsed = true;
    await otpRecord.save();
    if (otpRecord.isUsed) await otpCache.deleteOtp({ mobile, purpose });
    else await otpCache.updateAttempts({ mobile, purpose, otpState });
    throw new ApiError(400, "Invalid OTP", [
      { remainingAttempts: Math.max(otpRecord.maxAttempts - otpRecord.attempts, 0) },
    ]);
  }

  otpRecord.isUsed = true;
  otpRecord.verifiedAt = new Date();
  otpRecord.expiresAt = new Date(
    Date.now() + Number(process.env.OTP_VERIFICATION_WINDOW_MINUTES || 15) * 60 * 1000,
  );
  await otpRecord.save();
  await otpCache.deleteOtp({ mobile, purpose });

  return {
    mobile,
    purpose,
    verified: true,
    verificationId: otpRecord._id,
    verifiedAt: otpRecord.verifiedAt,
  };
};

module.exports = { sendOtp, verifyOtp, normalizeMobile };
