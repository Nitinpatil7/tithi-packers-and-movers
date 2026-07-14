const express = require("express");
const otpController = require("../controllers/otp.controller");
const {
  otpSendRateLimiter,
  otpVerifyRateLimiter,
} = require("../middlewere/ratelimit.middlewere");

const router = express.Router();

router.post("/send", otpSendRateLimiter, otpController.sendOtp);
router.post("/resend", otpSendRateLimiter, otpController.sendOtp);
router.post("/verify", otpVerifyRateLimiter, otpController.verifyOtp);

module.exports = router;
