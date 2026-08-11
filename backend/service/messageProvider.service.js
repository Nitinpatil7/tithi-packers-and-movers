const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const APITXT_SEND_OTP_URL = "https://apitxt.com/api/sendOTP";

const getApitxtAuthKey = () => String(process.env.APITXT_AUTHKEY || "").trim();

const normalizeApitxtMobile = (mobile) => {
  const digits = String(mobile || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const readProviderBody = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const sendViaApitxtOtp = async ({ mobile, otp }) => {
  const authkey = getApitxtAuthKey();

  if (!authkey) {
    return {
      success: false,
      provider: "apitxt",
      providerMessageId: null,
      response: null,
      errorMessage: "APitxt OTP configuration is incomplete",
    };
  }

  const params = new URLSearchParams({
    authkey,
    mobile: normalizeApitxtMobile(mobile),
    otp,
    channel: process.env.APITXT_OTP_CHANNEL || "sms",
    country: process.env.APITXT_COUNTRY || "91",
  });
  params.set(
    "message",
    `${otp} is your one-time password for Tithi Packers and Movers booking verification. Do not share this OTP with anyone.`,
  );

  if (process.env.APITXT_SMS_TEMPLATE_ID) {
    params.set("template_id", process.env.APITXT_SMS_TEMPLATE_ID);
  }

  const url = new URL(APITXT_SEND_OTP_URL);
  params.forEach((value, key) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const body = await readProviderBody(response);
  const isSuccess = response.ok && String(body.status || "").toLowerCase() === "success";

  return {
    success: isSuccess,
    provider: "apitxt",
    providerMessageId: body.data?.request_id || null,
    response: body,
    errorMessage: isSuccess ? null : body.message || body.error || `APitxt HTTP ${response.status}`,
  };
};

const sendMessage = async ({ channel, mobile, otp }) => {
  if (channel !== "sms" || !otp) {
    return {
      success: false,
      provider: "apitxt",
      providerMessageId: null,
      response: null,
      errorMessage: "Only APitxt SMS OTP delivery is configured",
    };
  }

  return sendViaApitxtOtp({ mobile, otp });
};

module.exports = sendMessage;
