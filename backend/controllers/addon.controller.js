const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const addOnService = require("../service/addon.service");

const createAddOn = asyncHandler(async (req, res) => {
  const addOn = await addOnService.createAddOn(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, addOn, "Add-on service created successfully"));
});

const getAllAddOnsForAdmin = asyncHandler(async (req, res) => {
  const addOns = await addOnService.getAllAddOnsForAdmin(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, addOns, "Add-on services fetched successfully"));
});

const getAddOnById = asyncHandler(async (req, res) => {
  const addOn = await addOnService.getAddOnById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, addOn, "Add-on service fetched successfully"));
});

const updateAddOn = asyncHandler(async (req, res) => {
  const addOn = await addOnService.updateAddOn(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, addOn, "Add-on service updated successfully"));
});

const deleteAddOn = asyncHandler(async (req, res) => {
  const addOn = await addOnService.deleteAddOn(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, addOn, "Add-on service deactivated successfully"));
});

const getAvailableAddOns = asyncHandler(async (req, res) => {
  const addOns = await addOnService.getAvailableAddOns(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, addOns, "Available add-ons fetched successfully"));
});

const getTriggerGroups = asyncHandler(async (req, res) => {
  const groups = await addOnService.getTriggerGroups(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, groups, "Searchable add-on trigger groups fetched successfully"));
});

const getTriggerItems = asyncHandler(async (req, res) => {
  const groups = await addOnService.getTriggerItems(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, groups, "Searchable add-on trigger items fetched successfully"));
});

module.exports = {
  createAddOn,
  getAllAddOnsForAdmin,
  getAddOnById,
  updateAddOn,
  deleteAddOn,
  getTriggerGroups,
  getTriggerItems,
  getAvailableAddOns,
};
