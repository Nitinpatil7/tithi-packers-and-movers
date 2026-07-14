
const express = require("express");
const testimonialController = require("../controllers/testimonial.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");

const router = express.Router();

router.get("/", testimonialController.getPublicTestimonials);

router.get("/admin/all", adminAuth, testimonialController.getAllTestimonialsForAdmin);

router.get("/:id", adminAuth, testimonialController.getTestimonialById);

router.post("/", adminAuth, testimonialController.createTestimonial);

router.patch("/:id", adminAuth, testimonialController.updateTestimonial);

router.delete("/:id", adminAuth, testimonialController.deleteTestimonial);

module.exports = router;
