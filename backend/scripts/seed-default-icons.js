require("dotenv").config();
const connectDB = require("../config/db");
const Item = require("../schema/Item.model");
const ItemCategory = require("../schema/ItemCategory.model");
const { DEFAULT_ITEM_ICON, inferItemIcon } = require("../utility/itemIconMatcher");

const CATEGORY_ICON_MAP = {
  "living room": "fi-rr-couch",
  bedroom: "fi-rr-bed-alt",
  kitchen: "fi-rr-pan-frying",
  other: "fi-rr-box",
  "dining room": "fi-rr-utensils",
  dining: "fi-rr-utensils",
  bathroom: "fi-rr-bath",
  office: "fi-rr-briefcase",
  electronics: "fi-rr-bolt",
  appliances: "fi-rr-refrigerator",
  furniture: "fi-rr-couch",
  vehicles: "fi-rr-car-side",
  vehicle: "fi-rr-car-side",
  storage: "fi-rr-archive",
  gym: "fi-rr-dumbbell-fitness",
};

const normalizeName = (value) => String(value || "").trim().toLowerCase();
const iconForCategory = (category) => CATEGORY_ICON_MAP[normalizeName(category.name)] || inferItemIcon(category.name) || DEFAULT_ITEM_ICON;

const run = async () => {
  await connectDB();

  const categories = await ItemCategory.find({}).lean();
  const iconByCategoryId = new Map(categories.map((category) => [String(category._id), iconForCategory(category)]));

  const categoryOps = categories.map((category) => ({
    updateOne: {
      filter: { _id: category._id },
      update: { $set: { icon: iconByCategoryId.get(String(category._id)) } },
    },
  }));

  const items = await Item.find({}).select("_id categoryId").lean();
  const itemOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $set: { icon: iconByCategoryId.get(String(item.categoryId)) || DEFAULT_ITEM_ICON } },
    },
  }));

  if (categoryOps.length) await ItemCategory.bulkWrite(categoryOps);
  if (itemOps.length) await Item.bulkWrite(itemOps);

  console.log("Default Uicons mapping used:");
  console.log(JSON.stringify(CATEGORY_ICON_MAP, null, 2));
  console.log(`Updated ${categoryOps.length} category icon(s) and ${itemOps.length} item icon(s).`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
