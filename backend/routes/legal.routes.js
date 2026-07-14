const express= require( "express");
const legalController = require("../controllers/legel.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");

const router = express.Router();

// Admin routes
router.get("/all", adminAuth, legalController.getAllLegalPagesForAdmin);
router.get("/id/:id", adminAuth, legalController.getLegalPageById);

router.post("/", adminAuth, legalController.createLegalPage);
router.patch("/:id", adminAuth, legalController.updateLegalPage);
router.delete("/:id", adminAuth, legalController.deleteLegalPage);

// Public route - always keep this last
router.get("/:slug", legalController.getPublicLegalPageBySlug);

module.exports = router;
