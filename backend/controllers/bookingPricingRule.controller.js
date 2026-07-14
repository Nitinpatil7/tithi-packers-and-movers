const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const service = require("../service/bookingPricingRule.service");

const handler = (fn, message, status = 200) => asyncHandler(async (req, res) => {
  const data = await fn(req);
  res.status(status).json(new ApiResponse(status, data, message));
});

module.exports = {
  getPublicRules: handler((req) => service.getPublicRules(req.query), "Booking pricing rules fetched"),
  getPublicRuleByService: handler((req) => service.getPublicRuleByService(req.params.serviceType), "Booking pricing rule fetched"),
  getAdminRules: handler((req) => service.getAdminRules(req.query), "Admin booking pricing rules fetched"),
  getAdminRuleById: handler((req) => service.getAdminRuleById(req.params.id), "Admin booking pricing rule fetched"),
  createRule: handler((req) => service.createRule(req.body), "Booking pricing rule created", 201),
  createDefaultRules: handler(() => service.createDefaultRules(), "Default booking pricing rules created", 201),
  updateRule: handler((req) => service.updateRule(req.params.id, req.body), "Booking pricing rule updated"),
  deleteRule: handler((req) => service.deleteRule(req.params.id), "Booking pricing rule deactivated"),
};
