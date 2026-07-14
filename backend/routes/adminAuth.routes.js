const express = require("express");
const controller = require("../controllers/adminAuth.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");
const { adminLoginRateLimiter } = require("../middlewere/ratelimit.middlewere");

const router = express.Router();

router.post("/login", adminLoginRateLimiter, controller.login);
router.get("/me", adminAuth, controller.me);
router.post("/logout", adminAuth, controller.logout);
router.patch("/change-password", adminAuth, controller.changePassword);
router.patch("/profile", adminAuth, controller.updateProfile);

module.exports = router;
