const express = require("express");
const contactController = require("../controllers/contact.controller")
const adminAuth = require("../middlewere/adminAuth.middlewere");
const router = express.Router();

router.post("/", contactController.createContactInquiry);

router.get("/", adminAuth, contactController.getAllContactInquiries);
router.get("/:id", adminAuth, contactController.getContactInquiryById);

router.patch("/:id", adminAuth, contactController.updateContactInquiry);

router.delete("/:id", adminAuth, contactController.deleteContactInquiry);

module.exports = router;
