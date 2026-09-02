
const express = require("express");
const notificationController = require("../controllers/notification.controller");
const notificationTemplateController = require("../controllers/notificationTemplate.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");

const router = express.Router();

router.use(adminAuth);
router.get("/", notificationController.getAllNotifications);
router.get("/templates/admin", notificationTemplateController.getTemplates);
router.patch("/templates/admin/:status", notificationTemplateController.updateTemplate);
router.get("/:id", notificationController.getNotificationById);

router.post("/send", notificationController.sendSingleNotification);
router.post("/broadcast", notificationController.sendBroadcastNotification);

router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
