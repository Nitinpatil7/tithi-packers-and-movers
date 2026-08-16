const express = require("express");
const controller = require("../controllers/adminAuth.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");
const { adminLoginRateLimiter, otpSendRateLimiter, otpVerifyRateLimiter } = require("../middlewere/ratelimit.middlewere");

const router = express.Router();

router.post("/login", adminLoginRateLimiter, controller.login);
router.post("/refresh", controller.refresh);
router.post("/password-reset/request", otpSendRateLimiter, controller.requestPasswordReset);
router.post("/password-reset/verify", otpVerifyRateLimiter, controller.verifyPasswordResetOtp);
router.post("/password-reset/complete", otpVerifyRateLimiter, controller.resetPasswordWithOtp);
router.get("/me", adminAuth, controller.me);
router.post("/logout", adminAuth, controller.logout);
router.patch("/change-password", adminAuth, controller.changePassword);
router.patch("/profile", adminAuth, controller.updateProfile);

module.exports = router;
