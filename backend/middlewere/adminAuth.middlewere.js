const adminAuthService = require("../service/adminAuth.service");
const ApiError = require("../utility/apierror");

const adminAuth = async (req, res, next) => {
  try {
    const bearer = req.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    const token = req.cookies?.admin_session || bearer;
    const { admin, session } = await adminAuthService.authenticate(token);
    req.admin = admin;
    req.adminSession = session;
    const passwordSetupRoute = [
      "/api/admin-auth/me",
      "/api/admin-auth/logout",
      "/api/admin-auth/change-password",
    ].includes(req.originalUrl.split("?")[0]);
    if (admin.mustChangePassword && !passwordSetupRoute) {
      throw new ApiError(403, "Default password must be changed before using admin features");
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminAuth;
