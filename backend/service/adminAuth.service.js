const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Admin = require("../schema/Admin.model");
const AdminSession = require("../schema/AdminSession.model");
const ApiError = require("../utility/apierror");

const SESSION_DAYS = Number(process.env.ADMIN_SESSION_DAYS || 7);
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
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await AdminSession.create({
    adminId: admin._id,
    tokenHash: hashToken(token),
    ip: requestMeta.ip,
    userAgent: requestMeta.userAgent,
    expiresAt,
  });
  admin.lastLoginAt = new Date();
  await admin.save();
  return { admin: publicAdmin(admin), token, expiresAt };
};

const authenticate = async (token) => {
  if (!token) throw new ApiError(401, "Admin login required");
  const session = await AdminSession.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  }).populate("adminId");
  if (!session || !session.adminId?.isActive) throw new ApiError(401, "Admin session is invalid or expired");
  session.lastUsedAt = new Date();
  await session.save();
  return { admin: session.adminId, session };
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

module.exports = {
  bootstrapDefaultAdmin,
  login,
  authenticate,
  logout,
  changePassword,
  updateProfile,
  publicAdmin,
};
