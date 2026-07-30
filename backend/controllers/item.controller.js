const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const service = require("../service/item.service");

const handler = (fn, message, status = 200) => asyncHandler(async (req, res) => {
  const data = await fn(req);
  res.status(status).json(new ApiResponse(status, data, message));
});

module.exports = {
  getPublicItems: handler((req) => service.getItems(req.query, true), "Active items fetched"),
  getPublicCatalog: handler((req) => service.getCatalog(req.query, true), "Section and group-wise catalog fetched"),
  getPublicSections: handler((req) => service.getSections(req.query, true), "Active sections fetched"),
  getPublicGroups: handler((req) => service.getGroups(req.query, true), "Active groups fetched"),
  getPublicSizes: handler((req) => service.getSizes(req.query, true), "Active size choices fetched"),
  getAdminItems: handler((req) => service.getItems(req.query), "Admin items fetched"),
  getAdminCatalog: handler((req) => service.getCatalog(req.query), "Admin section and group-wise catalog fetched"),
  createItem: handler((req) => service.createItem(req.body), "Item created", 201),
  updateItem: handler((req) => service.updateItem(req.params.id, req.body), "Item updated"),
  deleteItem: handler((req) => service.deleteItem(req.params.id), "Item deactivated"),
  reorderItems: handler((req) => service.reorderItems(req.body.groupId, req.body.orderedIds), "Items reordered"),
  getAdminSections: handler((req) => service.getSections(req.query), "Sections fetched"),
  createSection: handler((req) => service.createSection(req.body), "Section created", 201),
  updateSection: handler((req) => service.updateSection(req.params.id, req.body), "Section updated"),
  deleteSection: handler((req) => service.deleteSection(req.params.id), "Section and its groups/items deactivated"),
  getAdminGroups: handler((req) => service.getGroups(req.query), "Groups fetched"),
  createGroup: handler((req) => service.createGroup(req.body), "Group created", 201),
  updateGroup: handler((req) => service.updateGroup(req.params.id, req.body), "Group updated"),
  deleteGroup: handler((req) => service.deleteGroup(req.params.id), "Group and its items deactivated"),
  reorderGroups: handler((req) => service.reorderGroups(req.body.sectionId, req.body.orderedIds), "Groups reordered"),
  getAdminSizes: handler((req) => service.getSizes(req.query), "Size choices fetched"),
  createSize: handler((req) => service.createSize(req.body), "Size choice created", 201),
  updateSize: handler((req) => service.updateSize(req.params.id, req.body), "Size choice updated"),
  deleteSize: handler((req) => service.deleteSize(req.params.id), "Size choice deactivated"),
};
