const express = require("express");
const multer = require("multer");
const controller = require("../controllers/icon.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");
const ApiError = require("../utility/apierror");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!["image/png", "image/jpeg"].includes(file.mimetype)) {
      return callback(new ApiError(400, "Icon must be a PNG or JPEG image"));
    }
    return callback(null, true);
  },
});

const handleIconUpload = (req, res, next) => {
  upload.single("icon")(req, res, (error) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") return next(new ApiError(400, "Icon image must be 500 KB or smaller"));
    return next(error);
  });
};

router.post("/upload", adminAuth, handleIconUpload, controller.uploadIcon);

module.exports = router;
