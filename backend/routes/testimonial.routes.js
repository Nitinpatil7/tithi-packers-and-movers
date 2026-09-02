
const express = require("express");
const testimonialController = require("../controllers/testimonial.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");
const adminAuthService = require("../service/adminAuth.service");

const router = express.Router();

const optionalAdminAuth = async (req, res, next) => {
  try {
    const bearer = req.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    const token = req.cookies?.admin_session || bearer;
    if (!token) return next();
    const { admin, session } = await adminAuthService.authenticate(token);
    req.admin = admin;
    req.adminSession = session;
    return next();
  } catch (error) {
    return next(error);
  }
};

router.get("/", testimonialController.getPublicTestimonials);

router.get("/admin/all", adminAuth, testimonialController.getAllTestimonialsForAdmin);
router.patch("/admin/reorder", adminAuth, testimonialController.reorderTestimonials);
router.get("/feedback/:token", testimonialController.getFeedbackContext);
router.post("/feedback/:token", testimonialController.submitFeedback);

router.get("/:id", adminAuth, testimonialController.getTestimonialById);

router.post("/", optionalAdminAuth, testimonialController.createTestimonial);

router.patch("/:id", adminAuth, testimonialController.updateTestimonial);

router.delete("/:id", adminAuth, testimonialController.deleteTestimonial);

module.exports = router;
