const Otp = require("../schema/Otp.model");
const ApiError = require("../utility/apierror");
const { hashOtp, compareOtp } = require("../utility/hashOtp");
const sendMessage = require("./messageProvider.service");

const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;

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
  const latestOtp = await Otp.findOne({ mobile, purpose }).sort({ createdAt: -1 });

  if (latestOtp) {
    const secondsSinceLastOtp = (Date.now() - latestOtp.createdAt.getTime()) / 1000;
    if (secondsSinceLastOtp < RESEND_COOLDOWN_SECONDS) {
      throw new ApiError(
        429,
        `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastOtp)} seconds before requesting another OTP`,
      );
    }
  }

  await Otp.updateMany({ mobile, purpose, isUsed: false }, { $set: { isUsed: true } });

  const otp = process.env.OTP_STATIC_CODE || "123456";
  const otpRecord = await Otp.create({
    mobile,
    purpose,
    otpHash: await hashOtp(otp),
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    purgeAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const result = await sendMessage({
    channel: "sms",
    mobile,
    message: `${otp} is your Tithi Packers and Movers verification OTP. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    otp,
  });

  if (!result.success && process.env.OTP_ALLOW_FAKE_DELIVERY === "false") {
    await Otp.findByIdAndDelete(otpRecord._id);
    throw new ApiError(503, result.errorMessage || "Unable to send OTP");
  }

  return {
    mobile,
    purpose,
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    resendAfterSeconds: RESEND_COOLDOWN_SECONDS,
    devOtp: otp,
    deliveryMode: result.success ? "provider" : "fake",
  };
};

const verifyOtp = async ({ mobile: mobileInput, otp, purpose = "booking" }) => {
  const mobile = normalizeMobile(mobileInput);
  if (!/^\d{6}$/.test(String(otp || ""))) {
    throw new ApiError(400, "OTP must be a 6-digit number");
  }

  const otpRecord = await Otp.findOne({ mobile, purpose, isUsed: false })
    .sort({ createdAt: -1 })
    .select("+otpHash");

  if (!otpRecord) throw new ApiError(400, "OTP is invalid or already used");
  if (otpRecord.expiresAt <= new Date()) {
    otpRecord.isUsed = true;
    await otpRecord.save();
    throw new ApiError(400, "OTP has expired. Please request a new OTP");
  }
  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    otpRecord.isUsed = true;
    await otpRecord.save();
    throw new ApiError(429, "Maximum OTP attempts exceeded. Please request a new OTP");
  }

  const isValid = await compareOtp(String(otp), otpRecord.otpHash);
  if (!isValid) {
    otpRecord.attempts += 1;
    if (otpRecord.attempts >= otpRecord.maxAttempts) otpRecord.isUsed = true;
    await otpRecord.save();
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

  return {
    mobile,
    purpose,
    verified: true,
    verificationId: otpRecord._id,
    verifiedAt: otpRecord.verifiedAt,
  };
};

module.exports = { sendOtp, verifyOtp, normalizeMobile };
