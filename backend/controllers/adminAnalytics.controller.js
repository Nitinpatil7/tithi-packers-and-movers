const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const adminAnalyticsService = require("../service/adminAnalytics.service");

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await adminAnalyticsService.getDashboard();
  res.status(200).json(new ApiResponse(200, dashboard, "Admin dashboard statistics fetched"));
});

const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminAnalyticsService.getAnalytics();
  res.status(200).json(new ApiResponse(200, analytics, "Admin analytics fetched"));
});

module.exports = { getDashboard, getAnalytics };
