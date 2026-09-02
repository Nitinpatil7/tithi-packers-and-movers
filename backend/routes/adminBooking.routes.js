const express = require("express");
const controller = require("../controllers/booking.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");

const router = express.Router();

router.get("/by-phone/:phoneNumber", adminAuth, controller.getBookingsByPhone);

module.exports = router;
