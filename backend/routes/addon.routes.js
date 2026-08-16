const express = require("express");
const addOnController = require("../controllers/addon.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");

const router = express.Router();

router.get("/available", addOnController.getAvailableAddOns);

router.get("/admin/all", adminAuth, addOnController.getAllAddOnsForAdmin);
router.get("/admin/trigger-groups", adminAuth, addOnController.getTriggerGroups);
router.get("/admin/trigger-items", adminAuth, addOnController.getTriggerItems);

router.get("/:id", adminAuth, addOnController.getAddOnById);

router.post("/", adminAuth, addOnController.createAddOn);

router.patch("/:id", adminAuth, addOnController.updateAddOn);

router.delete("/:id", adminAuth, addOnController.deleteAddOn);

module.exports = router;
