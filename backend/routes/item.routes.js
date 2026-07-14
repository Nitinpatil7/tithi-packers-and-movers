const express = require("express");
const controller = require("../controllers/item.controller");
const adminAuth = require("../middlewere/adminAuth.middlewere");

const router = express.Router();

router.get("/", controller.getPublicItems);
router.get("/catalog", controller.getPublicCatalog);
router.get("/sections", controller.getPublicSections);
router.get("/groups", controller.getPublicGroups);
router.get("/sizes", controller.getPublicSizes);

router.get("/admin/catalog", adminAuth, controller.getAdminCatalog);
router.get("/admin/items", adminAuth, controller.getAdminItems);
router.post("/admin/items", adminAuth, controller.createItem);
router.patch("/admin/items/:id", adminAuth, controller.updateItem);
router.delete("/admin/items/:id", adminAuth, controller.deleteItem);
router.get("/admin/sections", adminAuth, controller.getAdminSections);
router.post("/admin/sections", adminAuth, controller.createSection);
router.patch("/admin/sections/:id", adminAuth, controller.updateSection);
router.delete("/admin/sections/:id", adminAuth, controller.deleteSection);
router.get("/admin/groups", adminAuth, controller.getAdminGroups);
router.post("/admin/groups", adminAuth, controller.createGroup);
router.patch("/admin/groups/:id", adminAuth, controller.updateGroup);
router.delete("/admin/groups/:id", adminAuth, controller.deleteGroup);
router.get("/admin/sizes", adminAuth, controller.getAdminSizes);
router.post("/admin/sizes", adminAuth, controller.createSize);
router.patch("/admin/sizes/:id", adminAuth, controller.updateSize);
router.delete("/admin/sizes/:id", adminAuth, controller.deleteSize);

module.exports = router;
