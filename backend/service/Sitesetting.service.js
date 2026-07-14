const sitesetting = require("../schema/Sitesetting.model");

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
  return setting;
};

module.exports = {
  getsitesetting,
  updatesitesetting,
};
