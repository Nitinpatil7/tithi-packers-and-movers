const express = require("express");
const controller = require("../controllers/inAppNotification.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");

const router = express.Router();

router.use(adminAuth);

router.get("/", controller.getNotifications);
router.get("/summary", controller.getDashboardSummary);
router.post("/new-booking", controller.createForNewBooking);
router.patch("/read-all", controller.markAllAsRead);
router.patch("/:id/read", controller.markAsRead);
router.delete("/:id", controller.deleteNotification);

module.exports = router;
