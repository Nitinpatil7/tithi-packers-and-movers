const sendViaMsg91Otp = async ({ mobile, otp }) => {
  const url = new URL("https://control.msg91.com/api/v5/otp");
  url.searchParams.set("template_id", process.env.MSG91_OTP_TEMPLATE_ID);
  url.searchParams.set("mobile", `91${mobile}`);
  url.searchParams.set("authkey", process.env.MSG91_AUTH_KEY);
  url.searchParams.set("otp", otp);
  const response = await fetch(url, { method: "POST" });
  const body = await response.json().catch(() => ({}));
  return {
    success: response.ok && body.type !== "error",
    provider: "msg91",
    providerMessageId: body.request_id || null,
    response: body,
    errorMessage: response.ok ? body.message : `MSG91 HTTP ${response.status}`,
  };
};

const sendViaTwilio = async ({ mobile, message }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const form = new URLSearchParams({
    To: `+91${mobile}`,
    From: process.env.TWILIO_FROM_NUMBER,
    Body: message,
  });
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${accountSid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  const body = await response.json().catch(() => ({}));
  return {
    success: response.ok,
    provider: "twilio",
    providerMessageId: body.sid || null,
    response: body,
    errorMessage: response.ok ? null : body.message || `Twilio HTTP ${response.status}`,
  };
};

const sendViaMetaWhatsApp = async ({ mobile, templateName, language, parameters }) => {
  const endpoint = `https://graph.facebook.com/${process.env.META_WHATSAPP_API_VERSION || "v22.0"}/${process.env.META_WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: `91${mobile}`,
      type: "template",
      template: {
        name: templateName,
        language: { code: language || "en" },
        components: [
          {
            type: "body",
            parameters: (parameters || []).map((value) => ({
              type: "text",
              text: String(value),
            })),
          },
        ],
      },
    }),
  });
  const body = await response.json().catch(() => ({}));
  return {
    success: response.ok,
    provider: "meta_whatsapp",
    providerMessageId: body.messages?.[0]?.id || null,
    response: body,
    errorMessage: response.ok
      ? null
      : body.error?.message || `Meta WhatsApp HTTP ${response.status}`,
  };
};

const sendMessage = async ({
  channel,
  mobile,
  message,
  otp,
  templateName,
  language,
  parameters,
}) => {
  const provider = (process.env.SMS_PROVIDER || "console").toLowerCase();

  if (channel === "whatsapp") {
    if (process.env.WHATSAPP_ENABLED !== "true") {
      if (process.env.WHATSAPP_FAKE_DELIVERY === "false") {
        return { success: false, provider: "disabled", errorMessage: "WhatsApp is disabled" };
      }
      console.log("DEV WHATSAPP SENT:", { mobile, message, templateName, parameters });
      return {
        success: true,
        provider: "dev_whatsapp",
        providerMessageId: `dev_wa_${Date.now()}`,
        response: { message: "WhatsApp message simulated until provider is connected" },
      };
    }
    if ((process.env.WHATSAPP_PROVIDER || "meta").toLowerCase() !== "meta") {
      return { success: false, provider: "not_configured", errorMessage: "Unsupported WhatsApp provider" };
    }
    if (
      !process.env.META_WHATSAPP_PHONE_NUMBER_ID ||
      !process.env.META_WHATSAPP_ACCESS_TOKEN ||
      !templateName
    ) {
      return { success: false, provider: "meta_whatsapp", errorMessage: "Meta WhatsApp configuration is incomplete" };
    }
    return sendViaMetaWhatsApp({ mobile, templateName, language, parameters });
  }

  if (channel === "sms" && provider === "msg91") {
    if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_OTP_TEMPLATE_ID || !otp) {
      return { success: false, provider, errorMessage: "MSG91 OTP configuration is incomplete" };
    }
    return sendViaMsg91Otp({ mobile, otp });
  }

  if (channel === "sms" && provider === "twilio") {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_NUMBER) {
      return { success: false, provider, errorMessage: "Twilio SMS configuration is incomplete" };
    }
    return sendViaTwilio({ mobile, message });
  }

  if (process.env.NODE_ENV !== "production" && provider === "console") {
    console.log("DEV MESSAGE SENT:", {
      channel,
      mobile,
      message,
    });

    return {
      success: true,
      provider: "dev_console",
      providerMessageId: `dev_${Date.now()}`,
      response: {
        message: "Message logged in development mode",
      },
    };
  }

  return {
    success: false,
    provider,
    providerMessageId: null,
    response: null,
    errorMessage: `Messaging provider '${provider}' is not configured`,
  };
};

module.exports = sendMessage;
