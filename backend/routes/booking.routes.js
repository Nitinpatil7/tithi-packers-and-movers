const express = require("express");
const controller = require("../controllers/booking.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");
const { bookingRateLimiter } = require("../middlewere/ratelimit.middlewere");

const router = express.Router();

router.post("/draft", bookingRateLimiter, controller.createDraft);
router.patch("/:bookingId/draft", bookingRateLimiter, controller.updateDraft);
router.get("/:bookingId/quote", controller.previewQuote);
router.post("/:bookingId/confirm", bookingRateLimiter, controller.confirmBooking);
router.get("/track", controller.trackBookingsByMobile);
router.get("/track/:bookingId", controller.trackBooking);

router.get("/admin/all", adminAuth, controller.getAllBookings);
router.get("/admin/customers", adminAuth, controller.getBookingCustomers);
router.get("/admin/:bookingId", adminAuth, controller.getBookingById);
router.patch("/admin/:bookingId", adminAuth, controller.updateBookingDetails);
router.patch("/admin/:bookingId/status", adminAuth, controller.updateBookingStatus);
router.patch("/admin/:bookingId/quote", adminAuth, controller.updateAdminQuote);

module.exports = router;
