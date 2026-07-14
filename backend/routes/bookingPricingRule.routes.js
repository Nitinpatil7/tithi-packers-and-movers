const express = require("express");
const controller = require("../controllers/bookingPricingRule.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");

const router = express.Router();

router.get("/", controller.getPublicRules);
router.get("/admin/all", adminAuth, controller.getAdminRules);
router.get("/admin/:id", adminAuth, controller.getAdminRuleById);
router.post("/admin/defaults", adminAuth, controller.createDefaultRules);
router.post("/admin", adminAuth, controller.createRule);
router.patch("/admin/:id", adminAuth, controller.updateRule);
router.delete("/admin/:id", adminAuth, controller.deleteRule);
router.get("/:serviceType", controller.getPublicRuleByService);

module.exports = router;
