const mongoose = require("mongoose");
const siteSettingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: "Tithi Packers and Movers",
    },

    settingkey: {
      type: String,
      default: "global",
    },

    tagline: String,

    aboutTitle: String,

    aboutDescription: String,

    phone: String,

    whatsappNumber: String,

    ownerWhatsappNumber: String,

    email: String,

    address: String,

    logoUrl: String,

    socialLinks: {
      facebook: String,
      instagram: String,
      linkedin: String,
      youtube: String,
      twitter: String,
    },

    stats: {
      yearsExperience: {
        type: Number,
        default: 5,
      },

      successfulMoves: {
        type: Number,
        default: 3000,
      },

      citiesCovered: {
        type: Number,
        default: 25,
      },

      customerSatisfaction: {
        type: Number,
        default: 98,
      },
    },

    serviceLabels: {
      local_shifting: { type: String, default: "Local Shifting" },
      intercity_moving: { type: String, default: "Intercity Moving" },
      porter_labour_service: { type: String, default: "Labour & Porter" },
    },

    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("sitesetting" , siteSettingSchema);
