const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const emailNotificationService = require("../service/emailNotification.service");

const getSettings = asyncHandler(async (req, res) => {
  const settings = await emailNotificationService.getSettings();
  res.status(200).json(new ApiResponse(200, settings, "Email notification settings fetched"));
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await emailNotificationService.updateSettings(req.body);
  res.status(200).json(new ApiResponse(200, settings, "Email notification settings updated"));
});

module.exports = {
  getSettings,
  updateSettings,
};
