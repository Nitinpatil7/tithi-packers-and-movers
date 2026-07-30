
const express = require("express");
const faqController = require("../controllers/faq.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");
const router = express.Router();

router.post("/", adminAuth, faqController.createFAQ);
router.patch("/reorder", adminAuth, faqController.reorderFAQs);

router.get("/", faqController.getAllFAQs);
router.get("/:id", faqController.getFAQById);

router.patch("/:id", adminAuth, faqController.updateFAQ);

router.delete("/:id", adminAuth, faqController.deleteFAQ);

module.exports = router;
