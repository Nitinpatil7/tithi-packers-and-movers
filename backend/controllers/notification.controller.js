
const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const notificationService = require("../service/notification.service");

const sendSingleNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.sendSingleNotification(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, notification, "Notification sent successfully"));
});

const sendBroadcastNotification = asyncHandler(async (req, res) => {
  const notifications = await notificationService.sendBroadcastNotification(
    req.body
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        notifications,
        "Broadcast notifications processed successfully"
      )
    );
});

const getAllNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getAllNotifications(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, notifications, "Notifications fetched successfully")
    );
});

const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await notificationService.getNotificationById(
    req.params.id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification fetched successfully"));
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.deleteNotification(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification deleted successfully"));
});

module.exports = {
  sendSingleNotification,
  sendBroadcastNotification,
  getAllNotifications,
  getNotificationById,
  deleteNotification,
};