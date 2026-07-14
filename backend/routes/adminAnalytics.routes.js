const express = require("express");
const controller = require("../controllers/adminAnalytics.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");

const router = express.Router();

router.use(adminAuth);
router.get("/dashboard", controller.getDashboard);
router.get("/overview", controller.getAnalytics);

module.exports = router;
