const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const adminAuthService = require("../service/adminAuth.service");

const cookieOptions = (expiresAt) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.ADMIN_COOKIE_SAME_SITE || "lax",
  expires: expiresAt,
  path: "/",
});

const login = asyncHandler(async (req, res) => {
  const result = await adminAuthService.login(req.body, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.cookie("admin_session", result.token, cookieOptions(result.expiresAt));
  const data = { admin: result.admin, expiresAt: result.expiresAt };
  if (process.env.ADMIN_EXPOSE_BEARER_TOKEN === "true") data.accessToken = result.token;
  res.status(200).json(new ApiResponse(200, data, "Admin login successful"));
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, adminAuthService.publicAdmin(req.admin), "Admin session fetched"),
  );
});

const logout = asyncHandler(async (req, res) => {
  await adminAuthService.logout(req.adminSession._id);
  res.clearCookie("admin_session", { ...cookieOptions(new Date(0)), expires: undefined });
  res.status(200).json(new ApiResponse(200, null, "Admin logged out"));
});

const changePassword = asyncHandler(async (req, res) => {
  const admin = await adminAuthService.changePassword(req.admin._id, req.body);
  res.clearCookie("admin_session", { ...cookieOptions(new Date(0)), expires: undefined });
  res.status(200).json(
    new ApiResponse(200, admin, "Password changed. Please log in again"),
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const admin = await adminAuthService.updateProfile(req.admin._id, req.body);
  res.status(200).json(new ApiResponse(200, admin, "Admin profile updated"));
});

module.exports = { login, me, logout, changePassword, updateProfile };
