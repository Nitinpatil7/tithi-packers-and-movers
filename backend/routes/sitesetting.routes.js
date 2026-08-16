const express = require("express")
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();

const settingcontroller = require("../controllers/Sitesetting.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");
const ApiError = require("../utility/apierror");

const logoDir = path.join(__dirname, "..", "public", "logo");
const allowedLogoTypes = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/svg+xml", ".svg"],
  ["image/webp", ".webp"],
]);

const storage = multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdirSync(logoDir, { recursive: true });
    callback(null, logoDir);
  },
  filename(req, file, callback) {
    const extension = allowedLogoTypes.get(file.mimetype);
    const suffix = crypto.randomBytes(6).toString("hex");
    callback(null, `logo-${Date.now()}-${suffix}${extension}`);
  },
});

const uploadLogo = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!allowedLogoTypes.has(file.mimetype)) {
      return callback(new ApiError(400, "Logo must be a PNG, JPG, SVG, or WebP image"));
    }
    return callback(null, true);
  },
});

const handleLogoUpload = (req, res, next) => {
  uploadLogo.single("logo")(req, res, (error) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") return next(new ApiError(400, "Logo image must be 2 MB or smaller"));
    return next(error);
  });
};

router.get('/',settingcontroller.getsetting);
router.patch("/", adminAuth, settingcontroller.updatesetting)
router.post("/logo", adminAuth, handleLogoUpload, settingcontroller.uploadlogo)

module.exports = router;
