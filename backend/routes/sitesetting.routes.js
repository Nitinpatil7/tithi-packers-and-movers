const express = require("express")
const router = express.Router();

const settingcontroller = require("../controllers/Sitesetting.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");

router.get('/',settingcontroller.getsetting);
router.patch("/", adminAuth, settingcontroller.updatesetting)

module.exports = router;
