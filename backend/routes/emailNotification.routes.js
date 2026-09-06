const express = require("express");
const controller = require("../controllers/emailNotification.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");

const router = express.Router();

router.use(adminAuth);
router.get("/admin/settings", controller.getSettings);
router.patch("/admin/settings", controller.updateSettings);

module.exports = router;
