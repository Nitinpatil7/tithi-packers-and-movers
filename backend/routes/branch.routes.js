const express = require("express");
const branchController = require("../controllers/branch.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");
const router = express.Router();

router.get("/", branchController.getallbranches);
router.get("/main", branchController.getmainbranch);
router.get("/:id", branchController.getbranchbyid);

router.post("/", adminAuth, branchController.createbranch);
router.patch("/:id", adminAuth, branchController.updatebranch);
router.delete("/:id", adminAuth, branchController.deletebranch);

module.exports = router;
