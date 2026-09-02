const express = require("express");
const multer = require("multer");
const controller = require("../controllers/booking.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");
const { bookingRateLimiter } = require("../middlewere/ratelimit.middlewere");
const ApiError = require("../utility/apierror");

const router = express.Router();

const completionProofUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)) {
      return callback(new ApiError(400, "Completion proof must be a PNG, JPEG, or WebP image"));
    }
    return callback(null, true);
  },
});

const handleCompletionProofUpload = (req, res, next) => {
  completionProofUpload.single("image")(req, res, (error) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") return next(new ApiError(400, "Completion proof image must be 3 MB or smaller"));
    return next(error);
  });
};

router.post("/draft", bookingRateLimiter, controller.createDraft);
router.patch("/:bookingId/draft", bookingRateLimiter, controller.updateDraft);
router.get("/:bookingId/quote", controller.previewQuote);
router.post("/:bookingId/confirm", bookingRateLimiter, controller.confirmBooking);
router.get("/track", controller.trackBookingsByMobile);
router.get("/track/:bookingId", controller.trackBooking);
router.patch("/:bookingId/update-items", bookingRateLimiter, controller.updateCustomerBookingItems);

router.get("/admin/all", adminAuth, controller.getAllBookings);
router.get("/admin/customers", adminAuth, controller.getBookingCustomers);
router.get("/admin/by-phone/:phoneNumber", adminAuth, controller.getBookingsByPhone);
router.get("/admin/:bookingId", adminAuth, controller.getBookingById);
router.patch("/admin/:bookingId", adminAuth, controller.updateBookingDetails);
router.patch("/admin/:bookingId/status", adminAuth, controller.updateBookingStatus);
router.post("/admin/:bookingId/completion-proof", adminAuth, handleCompletionProofUpload, controller.completeBookingWithProof);
router.patch("/admin/:bookingId/quote", adminAuth, controller.updateAdminQuote);

module.exports = router;
