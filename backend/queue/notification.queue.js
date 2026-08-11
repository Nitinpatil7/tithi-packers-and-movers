const { Queue, Worker } = require("bullmq");
const Notification = require("../schema/Notification.model");
const logger = require("../utility/logger");
const { getBullMqRedisOptions } = require("../config/redis");
const {
  buildWhatsAppActionUrl,
} = require("../service/whatsappTemplate.service");

const QUEUE_NAME = "notifications";

let notificationQueue;
let notificationWorker;

const getNotificationQueue = () => {
  if (!notificationQueue) {
    notificationQueue = new Queue(QUEUE_NAME, {
      ...getBullMqRedisOptions(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    });
  }
  return notificationQueue;
};

const enqueueNotificationDelivery = async (payload) => {
  const queue = getNotificationQueue();
  return queue.add("deliver", payload, {
    jobId: payload.notificationId ? `notification:${payload.notificationId}` : undefined,
  });
};

const processNotification = async (job) => {
  const { notificationId, providerPayload = {} } = job.data;
  const notification = await Notification.findById(notificationId);
  if (!notification) return null;

  if (notification.channel !== "whatsapp") {
    notification.status = "failed";
    notification.provider = "not_configured";
    notification.errorMessage = "Only manual WhatsApp notifications are configured";
    await notification.save();
    return notification;
  }

  const actionUrl = buildWhatsAppActionUrl({
    customerWhatsappNumber: providerPayload.customerWhatsappNumber || notification.customerMobile,
    message: providerPayload.message || notification.message,
  });

  notification.status = "sent";
  notification.provider = "manual_whatsapp";
  notification.providerMessageId = `manual_${Date.now()}`;
  notification.providerResponse = {
    actionUrl,
    ownerWhatsappNumber: providerPayload.ownerWhatsappNumber || null,
    trackingUrl: providerPayload.trackingUrl || null,
    note: "Open this WhatsApp link from the owner/admin WhatsApp account to send manually.",
  };
  notification.sentAt = new Date();
  await notification.save();
  return notification;
};

const startNotificationWorker = () => {
  if (notificationWorker || process.env.QUEUE_ENABLED === "false") return notificationWorker;

  notificationWorker = new Worker(QUEUE_NAME, processNotification, getBullMqRedisOptions());

  notificationWorker.on("completed", (job) => {
    logger.info("Notification job completed", { jobId: job.id });
  });

  notificationWorker.on("failed", async (job, error) => {
    logger.error("Notification job failed", { jobId: job?.id, error: error.message });
    const notificationId = job?.data?.notificationId;
    if (!notificationId) return;
    await Notification.findByIdAndUpdate(notificationId, {
      $set: {
        status: "failed",
        provider: "manual_whatsapp",
        errorMessage: error.message,
      },
    }).catch(() => {});
  });

  return notificationWorker;
};

module.exports = {
  enqueueNotificationDelivery,
  startNotificationWorker,
  processNotification,
};
