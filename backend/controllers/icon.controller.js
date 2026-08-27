const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const iconUploadService = require("../service/iconUpload.service");

const uploadIcon = asyncHandler(async (req, res) => {
  const result = await iconUploadService.uploadIcon(req.file);
  res.status(201).json(new ApiResponse(201, result, "Icon uploaded successfully"));
});

module.exports = { uploadIcon };
