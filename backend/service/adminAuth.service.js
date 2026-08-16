const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Admin = require("../schema/Admin.model");
const AdminSession = require("../schema/AdminSession.model");
const SiteSetting = require("../schema/Sitesetting.model");
const ApiError = require("../utility/apierror");
const otpService = require("./otp.service");

const SESSION_DAYS = Number(process.env.ADMIN_SESSION_DAYS || 7);
const ACCESS_MINUTES = Number(process.env.ADMIN_ACCESS_TOKEN_MINUTES || 60);
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const publicAdmin = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  mustChangePassword: admin.mustChangePassword,
  lastLoginAt: admin.lastLoginAt,
});

const bootstrapDefaultAdmin = async () => {
  if (await Admin.exists({})) return null;
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD are required for first admin setup");
  }
  if (password.length < 12) throw new Error("DEFAULT_ADMIN_PASSWORD must be at least 12 characters");
  return Admin.create({
    name: process.env.DEFAULT_ADMIN_NAME || "Tithi Admin",
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "super_admin",
    mustChangePassword: true,
  });
};

const login = async ({ email, password }, requestMeta = {}) => {
  const admin = await Admin.findOne({ email: String(email || "").toLowerCase(), isActive: true })
    .select("+passwordHash");
  if (!admin || !(await bcrypt.compare(String(password || ""), admin.passwordHash))) {
    throw new ApiError(401, "Invalid admin email or password");
  }

  const token = crypto.randomBytes(48).toString("hex");
  const refreshToken = crypto.randomBytes(64).toString("hex");
  const accessExpiresAt = new Date(Date.now() + ACCESS_MINUTES * 60 * 1000);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await AdminSession.create({
    adminId: admin._id,
    tokenHash: hashToken(token),
    refreshTokenHash: hashToken(refreshToken),
    ip: requestMeta.ip,
    userAgent: requestMeta.userAgent,
    accessExpiresAt,
    expiresAt,
  });
  admin.lastLoginAt = new Date();
  await admin.save();
  return { admin: publicAdmin(admin), token, refreshToken, accessExpiresAt, expiresAt };
};

const authenticate = async (token) => {
  if (!token) throw new ApiError(401, "Admin login required");
  const session = await AdminSession.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  }).populate("adminId");
  if (!session || !session.adminId?.isActive) throw new ApiError(401, "Admin session is invalid or expired");
  if (session.accessExpiresAt && session.accessExpiresAt <= new Date()) {
    throw new ApiError(401, "Admin session access token expired");
  }
  session.lastUsedAt = new Date();
  await session.save();
  return { admin: session.adminId, session };
};

const refresh = async (refreshToken, requestMeta = {}) => {
  if (!refreshToken) throw new ApiError(401, "Admin refresh token required");
  const session = await AdminSession.findOne({
    refreshTokenHash: hashToken(refreshToken),
    expiresAt: { $gt: new Date() },
  }).populate("adminId");
  if (!session || !session.adminId?.isActive) {
    throw new ApiError(401, "Admin refresh session is invalid or expired");
  }

  const token = crypto.randomBytes(48).toString("hex");
  const accessExpiresAt = new Date(Date.now() + ACCESS_MINUTES * 60 * 1000);
  session.tokenHash = hashToken(token);
  session.accessExpiresAt = accessExpiresAt;
  session.lastUsedAt = new Date();
  session.ip = requestMeta.ip || session.ip;
  session.userAgent = requestMeta.userAgent || session.userAgent;
  await session.save();
  return { admin: publicAdmin(session.adminId), token, accessExpiresAt, expiresAt: session.expiresAt };
};

const logout = async (sessionId) => AdminSession.findByIdAndDelete(sessionId);

const changePassword = async (adminId, payload) => {
  const admin = await Admin.findById(adminId).select("+passwordHash");
  if (!admin || !(await bcrypt.compare(String(payload.currentPassword || ""), admin.passwordHash))) {
    throw new ApiError(400, "Current password is incorrect");
  }
  if (String(payload.newPassword || "").length < 12) {
    throw new ApiError(400, "New password must be at least 12 characters");
  }
  if (await bcrypt.compare(payload.newPassword, admin.passwordHash)) {
    throw new ApiError(400, "New password must be different from current password");
  }
  admin.passwordHash = await bcrypt.hash(payload.newPassword, 12);
  admin.mustChangePassword = false;
  admin.passwordChangedAt = new Date();
  await admin.save();
  await AdminSession.deleteMany({ adminId: admin._id });
  return publicAdmin(admin);
};

const updateProfile = async (adminId, payload) => {
  const admin = await Admin.findById(adminId).select("+passwordHash");
  if (!admin || !(await bcrypt.compare(String(payload.currentPassword || ""), admin.passwordHash))) {
    throw new ApiError(400, "Current password is required to update admin profile");
  }
  if (payload.email) admin.email = String(payload.email).toLowerCase().trim();
  if (payload.name) admin.name = String(payload.name).trim();
  await admin.save();
  return publicAdmin(admin);
};

const getAdminResetMobile = async () => {
  const setting = await SiteSetting.findOne({}).sort({ createdAt: -1 }).lean();
  const mobile = setting?.ownerWhatsappNumber || setting?.whatsappNumber || setting?.phone;
  if (!mobile) throw new ApiError(400, "Admin mobile number is not configured in site settings");
  return otpService.normalizeMobile(mobile);
};

const findResetAdmin = async (email) => {
  const admin = await Admin.findOne({ email: String(email || "").toLowerCase().trim(), isActive: true });
  if (!admin) throw new ApiError(404, "Admin account not found");
  return admin;
};

const requestPasswordReset = async ({ email }) => {
  const admin = await findResetAdmin(email);
  const mobile = await getAdminResetMobile();
  const result = await otpService.sendOtp({ mobile, purpose: "admin_password_reset" });
  return {
    email: admin.email,
    mobileLast4: mobile.slice(-4),
    expiresInSeconds: result.expiresInSeconds,
    resendAfterSeconds: result.resendAfterSeconds,
    provider: result.provider,
  };
};

const verifyPasswordResetOtp = async ({ email, otp }) => {
  const admin = await findResetAdmin(email);
  const mobile = await getAdminResetMobile();
  const verification = await otpService.verifyOtp({ mobile, otp, purpose: "admin_password_reset" });
  return {
    email: admin.email,
    mobileLast4: mobile.slice(-4),
    verificationId: verification.verificationId,
  };
};

const resetPasswordWithOtp = async ({ email, verificationId, newPassword }) => {
  const admin = await Admin.findOne({ email: String(email || "").toLowerCase().trim(), isActive: true }).select("+passwordHash");
  if (!admin) throw new ApiError(404, "Admin account not found");
  if (String(newPassword || "").length < 12) throw new ApiError(400, "New password must be at least 12 characters");
  if (await bcrypt.compare(newPassword, admin.passwordHash)) {
    throw new ApiError(400, "New password must be different from current password");
  }

  const mobile = await getAdminResetMobile();
  const otpRecord = await otpService.assertVerifiedOtp({
    verificationId,
    mobile,
    purpose: "admin_password_reset",
  });

  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  admin.mustChangePassword = false;
  admin.passwordChangedAt = new Date();
  await admin.save();
  await AdminSession.deleteMany({ adminId: admin._id });
  otpRecord.expiresAt = new Date();
  await otpRecord.save();
  return publicAdmin(admin);
};

module.exports = {
  bootstrapDefaultAdmin,
  login,
  authenticate,
  refresh,
  logout,
  changePassword,
  updateProfile,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
  publicAdmin,
};
