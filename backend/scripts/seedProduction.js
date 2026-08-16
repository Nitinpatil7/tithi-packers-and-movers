const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const Admin = require("../schema/Admin.model");
const AddOnService = require("../schema/Addonservice.model");
const BookingPricingRule = require("../schema/BookingPricingRule.model");
const Item = require("../schema/Item.model");
const ItemCategory = require("../schema/ItemCategory.model");
const ItemGroup = require("../schema/ItemGroup.model");
const ItemSize = require("../schema/ItemSize.model");
const { DEFAULTS_BY_SERVICE } = require("../service/bookingPricingRule.service");
const itemCatalog = require("../data/itemCatalog.json");

const slugify = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const seedItems = async () => {
  const sectionNames = [...new Set(itemCatalog.map((record) => record.section))];

  await ItemCategory.bulkWrite(
    sectionNames.map((name, index) => ({
      updateOne: {
        filter: { key: slugify(name) },
        update: {
          $set: { name, isActive: true, sortOrder: index },
          $setOnInsert: { key: slugify(name) },
        },
        upsert: true,
      },
    })),
  );

  const categories = await ItemCategory.find({ key: { $in: sectionNames.map(slugify) } });
  const categoryByKey = new Map(categories.map((category) => [category.key, category._id]));
  const sizeKeys = [...new Set(itemCatalog.map((record) => record.sizeTag.toUpperCase()))];

  await ItemSize.bulkWrite(
    sizeKeys.map((key, index) => ({
      updateOne: {
        filter: { key },
        update: {
          $set: { label: key, isActive: true, sortOrder: index },
          $setOnInsert: { key },
        },
        upsert: true,
      },
    })),
  );

  const sizes = await ItemSize.find({ key: { $in: sizeKeys } });
  const sizeByKey = new Map(sizes.map((size) => [size.key, size]));
  const groupRecords = [
    ...new Map(
      itemCatalog.map((record) => {
        const sectionKey = slugify(record.section);
        const groupKey = slugify(record.group);
        return [
          `${sectionKey}:${groupKey}`,
          {
            key: groupKey,
            name: record.group,
            section: record.section,
            categoryId: categoryByKey.get(sectionKey),
          },
        ];
      }),
    ).values(),
  ];

  await ItemGroup.bulkWrite(
    groupRecords.map((group, index) => ({
      updateOne: {
        filter: { categoryId: group.categoryId, key: group.key },
        update: {
          $set: { ...group, isActive: true, sortOrder: index },
        },
        upsert: true,
      },
    })),
  );

  const groups = await ItemGroup.find({});
  const groupByComposite = new Map(
    groups.map((group) => [`${String(group.categoryId)}:${group.key}`, group._id]),
  );

  const result = await Item.bulkWrite(
    itemCatalog.map((record) => {
      const categoryId = categoryByKey.get(slugify(record.section));
      const size = sizeByKey.get(record.sizeTag.toUpperCase());
      return {
        updateOne: {
          filter: { key: record.key },
          update: {
            $set: {
              key: record.key,
              categoryId,
              section: record.section,
              groupId: groupByComposite.get(`${String(categoryId)}:${slugify(record.group)}`),
              group: record.group,
              name: record.name,
              sizes: [
                {
                  sizeId: size._id,
                  sizeKey: size.key,
                  label: size.label,
                  price: record.price,
                  isActive: record.isActive,
                  sortOrder: 0,
                },
              ],
              isActive: record.isActive,
              sortOrder: record.sortOrder,
            },
            $unset: { sizeTag: "", price: "" },
          },
          upsert: true,
        },
      };
    }),
  );

  const legacyAddOns = await AddOnService.collection
    .find({
      $or: [{ triggerItemIds: { $exists: true } }, { triggerItems: { $exists: true } }],
    })
    .toArray();

  for (const addOn of legacyAddOns) {
    const legacyIds = Array.isArray(addOn.triggerItemIds) ? addOn.triggerItemIds : [];
    const legacyKeys = Array.isArray(addOn.triggerItems) ? addOn.triggerItems : [];
    const matchedItems = await Item.find({
      $or: [{ _id: { $in: legacyIds } }, { key: { $in: legacyKeys } }],
    }).select("groupId");
    const triggerGroupIds = [...new Set(matchedItems.map((item) => String(item.groupId)))].map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    await AddOnService.collection.updateOne(
      { _id: addOn._id },
      { $set: { triggerGroupIds }, $unset: { triggerItemIds: "", triggerItems: "" } },
    );
  }

  return {
    catalogRecords: itemCatalog.length,
    categories: categories.length,
    sizes: sizeKeys.length,
    groups: groupRecords.length,
    upserted: result.upsertedCount,
    modified: result.modifiedCount,
    migratedLegacyAddOns: legacyAddOns.length,
    activeItems: await Item.countDocuments({ isActive: true }),
    totalItems: await Item.countDocuments({}),
  };
};

const seedAdmin = async () => {
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD are required");
  }
  if (password.length < 12) throw new Error("DEFAULT_ADMIN_PASSWORD must be at least 12 characters");

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    {
      $set: {
        name: process.env.DEFAULT_ADMIN_NAME || "Tithi Admin",
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "super_admin",
        isActive: true,
        mustChangePassword: false,
        passwordChangedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return { id: admin._id, email: admin.email, role: admin.role };
};

const seedPricingRules = async () => {
  const defaults = Object.values(DEFAULTS_BY_SERVICE);
  const result = await BookingPricingRule.bulkWrite(
    defaults.map((rule, index) => ({
      updateOne: {
        filter: { serviceType: rule.serviceType },
        update: {
          $set: {
            ...rule,
            isActive: true,
            sortOrder: rule.sortOrder ?? index,
          },
        },
        upsert: true,
      },
    })),
  );

  return {
    expected: defaults.length,
    total: await BookingPricingRule.countDocuments({}),
    active: await BookingPricingRule.countDocuments({ isActive: true }),
    upserted: result.upsertedCount,
    modified: result.modifiedCount,
  };
};

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI);
  const [items, pricing, admin] = await Promise.all([
    seedItems(),
    seedPricingRules(),
    seedAdmin(),
  ]);
  console.log(JSON.stringify({ database: "connected", items, pricing, admin }, null, 2));
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
