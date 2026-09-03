const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const Booking = require("../schema/Booking.model");
const BookingPricingRule = require("../schema/BookingPricingRule.model");
const AddOnService = require("../schema/Addonservice.model");
const Testimonial = require("../schema/Testimonial.model");
const SiteSetting = require("../schema/Sitesetting.model");

const LEGACY_SERVICE_TYPES = [
  "ordinary",
  "ordinary_service",
  "ordinary_services",
  "packing",
  "packing_service",
  "packing-service",
  "commercial",
  "commercial_moving",
  "commercial-moving",
  "business_relocation",
];

const CONFIRMED = process.env.CONFIRM_DELETE_GHOST_SERVICES === "yes";

async function countCollection(model, filter) {
  return model.collection.countDocuments(filter);
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });

  const serviceFilter = { serviceType: { $in: LEGACY_SERVICE_TYPES } };
  const addOnFilter = { appliesToServiceTypes: { $in: LEGACY_SERVICE_TYPES } };
  const siteSettingFilter = {
    $or: [
      { "serviceLabels.ordinary": { $exists: true } },
      { "serviceLabels.ordinary_service": { $exists: true } },
      { "serviceLabels.ordinary_services": { $exists: true } },
      { "serviceLabels.packing": { $exists: true } },
      { "serviceLabels.packing_service": { $exists: true } },
      { "serviceLabels.commercial": { $exists: true } },
      { "serviceLabels.commercial_moving": { $exists: true } },
      { "serviceLabels.business_relocation": { $exists: true } },
    ],
  };

  const counts = {
    bookings: await countCollection(Booking, serviceFilter),
    bookingPricingRules: await countCollection(BookingPricingRule, serviceFilter),
    testimonials: await countCollection(Testimonial, serviceFilter),
    addOnsWithLegacyAppliesTo: await countCollection(AddOnService, addOnFilter),
    siteSettingsWithLegacyLabels: await countCollection(SiteSetting, siteSettingFilter),
  };

  console.log("Ghost service cleanup scan:");
  console.table(counts);

  if (!CONFIRMED) {
    console.log("Dry run only. Re-run with CONFIRM_DELETE_GHOST_SERVICES=yes to apply cleanup.");
    return;
  }

  const results = {};
  results.bookings = await Booking.collection.deleteMany(serviceFilter);
  results.bookingPricingRules = await BookingPricingRule.collection.deleteMany(serviceFilter);
  results.testimonials = await Testimonial.collection.deleteMany(serviceFilter);
  results.addOns = await AddOnService.collection.updateMany(
    addOnFilter,
    { $pull: { appliesToServiceTypes: { $in: LEGACY_SERVICE_TYPES } } },
  );
  results.siteSettings = await SiteSetting.collection.updateMany(
    siteSettingFilter,
    {
      $unset: {
        "serviceLabels.ordinary": "",
        "serviceLabels.ordinary_service": "",
        "serviceLabels.ordinary_services": "",
        "serviceLabels.packing": "",
        "serviceLabels.packing_service": "",
        "serviceLabels.commercial": "",
        "serviceLabels.commercial_moving": "",
        "serviceLabels.business_relocation": "",
      },
    },
  );

  console.log("Ghost service cleanup applied:");
  console.table({
    bookingsDeleted: results.bookings.deletedCount,
    bookingPricingRulesDeleted: results.bookingPricingRules.deletedCount,
    testimonialsDeleted: results.testimonials.deletedCount,
    addOnsUpdated: results.addOns.modifiedCount,
    siteSettingsUpdated: results.siteSettings.modifiedCount,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
