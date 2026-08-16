require("dotenv").config();
const connectDB = require("../config/db");
const Item = require("../schema/Item.model");
const { inferItemIcon } = require("../utility/itemIconMatcher");

const run = async () => {
  await connectDB();
  const items = await Item.find({});
  const operations = items.map((item) => {
    const icon = item.icon || inferItemIcon(item.name);
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { icon } },
      },
    };
  });
  if (operations.length) await Item.bulkWrite(operations);
  console.log(`Backfilled icons for ${operations.length} item(s).`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
