const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const adminAuthService = require("../service/adminAuth.service");

const getAdminCookieSameSite = () => {
  if (process.env.NODE_ENV === "production") return "none";
  return process.env.ADMIN_COOKIE_SAME_SITE || "lax";
};

const cookieOptions = (expiresAt) => {
  const sameSite = getAdminCookieSameSite();
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || sameSite === "none",
    sameSite,
    expires: expiresAt,
    path: "/",
  };
};

const login = asyncHandler(async (req, res) => {
  const result = await adminAuthService.login(req.body, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.cookie("admin_session", result.token, cookieOptions(result.accessExpiresAt));
  res.cookie("admin_refresh", result.refreshToken, cookieOptions(result.expiresAt));
  const data = { admin: result.admin, accessExpiresAt: result.accessExpiresAt, expiresAt: result.expiresAt };
  if (process.env.ADMIN_EXPOSE_BEARER_TOKEN === "true") data.accessToken = result.token;
  res.status(200).json(new ApiResponse(200, data, "Admin login successful"));
});

const refresh = asyncHandler(async (req, res) => {
  const result = await adminAuthService.refresh(req.cookies?.admin_refresh, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.cookie("admin_session", result.token, cookieOptions(result.accessExpiresAt));
  const data = { admin: result.admin, accessExpiresAt: result.accessExpiresAt, expiresAt: result.expiresAt };
  if (process.env.ADMIN_EXPOSE_BEARER_TOKEN === "true") data.accessToken = result.token;
  res.status(200).json(new ApiResponse(200, data, "Admin session refreshed"));
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, adminAuthService.publicAdmin(req.admin), "Admin session fetched"),
  );
});

const logout = asyncHandler(async (req, res) => {
  await adminAuthService.logout(req.adminSession._id);
  res.clearCookie("admin_session", { ...cookieOptions(new Date(0)), expires: undefined });
  res.clearCookie("admin_refresh", { ...cookieOptions(new Date(0)), expires: undefined });
  res.status(200).json(new ApiResponse(200, null, "Admin logged out"));
});

const changePassword = asyncHandler(async (req, res) => {
  const admin = await adminAuthService.changePassword(req.admin._id, req.body);
  res.clearCookie("admin_session", { ...cookieOptions(new Date(0)), expires: undefined });
  res.clearCookie("admin_refresh", { ...cookieOptions(new Date(0)), expires: undefined });
  res.status(200).json(
    new ApiResponse(200, admin, "Password changed. Please log in again"),
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const admin = await adminAuthService.updateProfile(req.admin._id, req.body);
  res.status(200).json(new ApiResponse(200, admin, "Admin profile updated"));
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const result = await adminAuthService.requestPasswordReset(req.body);
  res.status(200).json(new ApiResponse(200, result, "Admin password reset OTP sent"));
});

const verifyPasswordResetOtp = asyncHandler(async (req, res) => {
  const result = await adminAuthService.verifyPasswordResetOtp(req.body);
  res.status(200).json(new ApiResponse(200, result, "Admin password reset OTP verified"));
});

const resetPasswordWithOtp = asyncHandler(async (req, res) => {
  const admin = await adminAuthService.resetPasswordWithOtp(req.body);
  res.status(200).json(new ApiResponse(200, admin, "Admin password reset successfully"));
});

module.exports = {
  login,
  refresh,
  me,
  logout,
  changePassword,
  updateProfile,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
};
