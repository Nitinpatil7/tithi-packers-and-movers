const sitesetting = require("../schema/Sitesetting.model");
const fs = require("fs/promises");
const path = require("path");
const { notifyContentChange } = require("../utility/contentEvents");

const getsitesetting = async () => {
  let setting = await sitesetting.findOne({ settingkey: "global" });

  if (!setting) {
    setting = await sitesetting.create({
      settingkey: "global",
    });
  }
  return setting;
};

const updatesitesetting = async (payload) => {
  const setting = await sitesetting.findOneAndUpdate(
    { settingkey: "global" },
    { $set: payload },
    {
      new: true,
      upsert: true,
      runvalidators: true,
      setdefaultOninsert: true,
    },
  );
  notifyContentChange("site-setting", "updated", { id: setting._id });
  return setting;
};

const removePreviousLocalLogo = async (logoUrl) => {
  if (!logoUrl || !logoUrl.startsWith("/logo/")) return;
  const fileName = path.basename(logoUrl);
  if (!fileName || fileName !== logoUrl.replace("/logo/", "")) return;

  const filePath = path.join(__dirname, "..", "public", "logo", fileName);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") console.warn(`Could not delete old logo file: ${filePath}`, error.message);
  }
};

const updateLogo = async (logoUrl) => {
  const previous = await getsitesetting();
  const setting = await updatesitesetting({ logoUrl });

  if (previous.logoUrl && previous.logoUrl !== logoUrl) {
    await removePreviousLocalLogo(previous.logoUrl);
  }

  return setting;
};

module.exports = {
  getsitesetting,
  updatesitesetting,
  updateLogo,
};
