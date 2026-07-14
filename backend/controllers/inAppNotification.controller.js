const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const service = require("../service/inAppNotification.service");

const createForNewBooking = asyncHandler(async (req, res) => {
  const notification = await service.createNewBookingNotification(req.body.bookingId);
  res.status(201).json(new ApiResponse(201, notification, "New booking notification created"));
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await service.getNotifications(req.query);
  res.status(200).json(new ApiResponse(200, notifications, "In-app notifications fetched"));
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await service.getDashboardSummary();
  res.status(200).json(new ApiResponse(200, summary, "Notification dashboard summary fetched"));
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await service.markAsRead(req.params.id);
  res.status(200).json(new ApiResponse(200, notification, "Notification marked as read"));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await service.markAllAsRead();
  res.status(200).json(new ApiResponse(200, result, "All notifications marked as read"));
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await service.deleteNotification(req.params.id);
  res.status(200).json(new ApiResponse(200, notification, "In-app notification deleted"));
});

module.exports = {
  createForNewBooking,
  getNotifications,
  getDashboardSummary,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
