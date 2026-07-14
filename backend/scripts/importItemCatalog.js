const mongoose = require("mongoose");
require("dotenv").config();

const Item = require("../schema/Item.model");
const ItemCategory = require("../schema/ItemCategory.model");
const ItemGroup = require("../schema/ItemGroup.model");
const ItemSize = require("../schema/ItemSize.model");
const AddOnService = require("../schema/Addonservice.model");
const itemCatalog = require("../data/itemCatalog.json");

const slugify = (value) => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");

  await mongoose.connect(process.env.MONGO_URI);
  const sectionNames = [...new Set(itemCatalog.map((record) => record.section))];
  await ItemCategory.bulkWrite(sectionNames.map((name, index) => ({
    updateOne: {
      filter: { key: slugify(name) },
      update: { $setOnInsert: { key: slugify(name), name, isActive: true, sortOrder: index } },
      upsert: true,
    },
  })));
  const categories = await ItemCategory.find({ key: { $in: sectionNames.map(slugify) } });
  const categoryByKey = new Map(categories.map((category) => [category.key, category._id]));
  const sizeKeys = [...new Set(itemCatalog.map((record) => record.sizeTag.toUpperCase()))];
  await ItemSize.bulkWrite(sizeKeys.map((key, index) => ({
    updateOne: {
      filter: { key },
      update: { $setOnInsert: { key, label: key, isActive: true, sortOrder: index } },
      upsert: true,
    },
  })));
  const sizes = await ItemSize.find({ key: { $in: sizeKeys } });
  const sizeByKey = new Map(sizes.map((size) => [size.key, size]));
  const groupRecords = [...new Map(itemCatalog.map((record) => {
    const sectionKey = slugify(record.section);
    const groupKey = slugify(record.group);
    return [`${sectionKey}:${groupKey}`, {
      key: groupKey,
      name: record.group,
      section: record.section,
      categoryId: categoryByKey.get(sectionKey),
    }];
  })).values()];
  await ItemGroup.bulkWrite(groupRecords.map((group, index) => ({
    updateOne: {
      filter: { categoryId: group.categoryId, key: group.key },
      update: { $setOnInsert: { ...group, isActive: true, sortOrder: index } },
      upsert: true,
    },
  })));
  const groups = await ItemGroup.find({});
  const groupByComposite = new Map(groups.map((group) => [
    `${String(group.categoryId)}:${group.key}`,
    group._id,
  ]));
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
              sizes: [{
                sizeId: size._id,
                sizeKey: size.key,
                label: size.label,
                price: record.price,
                isActive: record.isActive,
                sortOrder: 0,
              }],
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
  const legacyAddOns = await AddOnService.collection.find({
    $or: [
      { triggerItemIds: { $exists: true } },
      { triggerItems: { $exists: true } },
    ],
  }).toArray();
  for (const addOn of legacyAddOns) {
    const legacyIds = Array.isArray(addOn.triggerItemIds) ? addOn.triggerItemIds : [];
    const legacyKeys = Array.isArray(addOn.triggerItems) ? addOn.triggerItems : [];
    const matchedItems = await Item.find({
      $or: [
        { _id: { $in: legacyIds } },
        { key: { $in: legacyKeys } },
      ],
    }).select("groupId");
    const triggerGroupIds = [...new Set(matchedItems.map((item) => String(item.groupId)))]
      .map((id) => new mongoose.Types.ObjectId(id));
    await AddOnService.collection.updateOne(
      { _id: addOn._id },
      {
        $set: { triggerGroupIds },
        $unset: { triggerItemIds: "", triggerItems: "" },
      },
    );
  }

  console.log({
    totalItems: itemCatalog.length,
    totalCategories: categories.length,
    totalSizes: sizeKeys.length,
    totalGroups: groupRecords.length,
    migratedLegacyAddOns: legacyAddOns.length,
    upserted: result.upsertedCount,
    modified: result.modifiedCount,
    inactiveMissingPriceItems: itemCatalog
      .filter((record) => !record.isActive)
      .map((record) => record.name),
  });
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
