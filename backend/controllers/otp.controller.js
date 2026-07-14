const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const otpService = require("../service/otp.service");

const sendOtp = asyncHandler(async (req, res) => {
  const result = await otpService.sendOtp(req.body);
  res.status(201).json(new ApiResponse(201, result, "OTP sent successfully"));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await otpService.verifyOtp(req.body);
  res.status(200).json(new ApiResponse(200, result, "Mobile number verified successfully"));
});

module.exports = { sendOtp, verifyOtp };
