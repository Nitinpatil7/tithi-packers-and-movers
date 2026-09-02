const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const service = require("../service/notificationTemplate.service");

const getTemplates = asyncHandler(async (req, res) => {
  const templates = await service.getTemplates();
  res.status(200).json(new ApiResponse(200, templates, "Notification templates fetched"));
});

const updateTemplate = asyncHandler(async (req, res) => {
  const template = await service.updateTemplate(req.params.status, req.body);
  res.status(200).json(new ApiResponse(200, template, "Notification template updated"));
});

module.exports = { getTemplates, updateTemplate };
