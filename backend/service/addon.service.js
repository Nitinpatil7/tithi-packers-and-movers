const mongoose = require("mongoose");
const AddOnService = require("../schema/Addonservice.model");
const Item = require("../schema/Item.model");
const ItemGroup = require("../schema/ItemGroup.model");
const ItemCategory = require("../schema/ItemCategory.model");
const ApiError = require("../utility/apierror");

const SERVICE_TYPES = ["local_shifting", "intercity_moving"];
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const cleanIcon = (value) => {
  const icon = String(value || "").trim();
  return icon || null;
};

const normalizeTriggers = async (payload) => {
  const normalized = { ...payload };
  if (payload.icon !== undefined) normalized.icon = cleanIcon(payload.icon);
  if (payload.triggerCategoryIds !== undefined) {
    const ids = [...new Set((payload.triggerCategoryIds || []).map(String))];
    if (ids.some((id) => !mongoose.isValidObjectId(id))) throw new ApiError(400, "Invalid trigger category ID");
    const categories = await ItemCategory.find({ _id: { $in: ids }, isActive: true });
    if (categories.length !== ids.length) throw new ApiError(400, "One or more trigger categories are invalid or inactive");
    normalized.triggerCategoryIds = categories.map((category) => category._id);
  }
  if (payload.triggerGroupIds !== undefined) {
    const ids = [...new Set((payload.triggerGroupIds || []).map(String))];
    if (ids.some((id) => !mongoose.isValidObjectId(id))) throw new ApiError(400, "Invalid trigger group ID");
    const groups = await ItemGroup.find({ _id: { $in: ids }, isActive: true });
    if (groups.length !== ids.length) throw new ApiError(400, "One or more trigger groups are invalid or inactive");
    normalized.triggerGroupIds = groups.map((group) => group._id);
  }
  if (payload.triggerItemIds !== undefined) {
    const ids = [...new Set((payload.triggerItemIds || []).map(String))];
    if (ids.some((id) => !mongoose.isValidObjectId(id))) throw new ApiError(400, "Invalid trigger item ID");
    const items = await Item.find({ _id: { $in: ids }, isActive: true });
    if (items.length !== ids.length) throw new ApiError(400, "One or more trigger items are invalid or inactive");
    normalized.triggerItemIds = items.map((item) => item._id);
  }
  return normalized;
};

const populated = (query) => query.populate({
  path: "triggerCategoryIds",
  select: "key name isActive sortOrder",
}).populate({
  path: "triggerGroupIds",
  select: "key name section categoryId isActive sortOrder",
  populate: { path: "categoryId", select: "key name isActive" },
}).populate({
  path: "triggerItemIds",
  select: "key name section group groupId categoryId isActive sortOrder",
  populate: [
    { path: "groupId", select: "key name section categoryId isActive sortOrder" },
    { path: "categoryId", select: "key name isActive" },
  ],
});

const createAddOn = async (payload) => {
  const addOn = await AddOnService.create(await normalizeTriggers(payload));
  return populated(AddOnService.findById(addOn._id));
};
const getAllAddOnsForAdmin = (query = {}) => {
  const filter = {};
  if (query.isActive === "true") filter.isActive = true;
  if (query.isActive === "false") filter.isActive = false;
  if (query.serviceType) filter.appliesToServiceTypes = query.serviceType;
  return populated(AddOnService.find(filter)).sort({ sortOrder: 1, createdAt: -1 });
};
const getAddOnById = async (id) => {
  const addOn = await populated(AddOnService.findById(id));
  if (!addOn) throw new ApiError(404, "Add-on service not found");
  return addOn;
};
const updateAddOn = async (id, payload) => {
  const addOn = await populated(AddOnService.findByIdAndUpdate(id,
    { $set: await normalizeTriggers(payload) }, { new: true, runValidators: true }));
  if (!addOn) throw new ApiError(404, "Add-on service not found");
  return addOn;
};
const deleteAddOn = async (id) => {
  const addOn = await AddOnService.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
  if (!addOn) throw new ApiError(404, "Add-on service not found");
  return addOn;
};

const getTriggerGroups = async (query = {}) => {
  const filter = { isActive: true };
  if (query.sectionId) filter.categoryId = query.sectionId;
  if (query.section) filter.section = new RegExp(`^${escapeRegex(query.section)}$`, "i");
  if (query.search?.trim()) {
    const regex = { $regex: escapeRegex(query.search.trim()), $options: "i" };
    const itemFilter = { isActive: true, name: regex };
    if (query.sectionId) itemFilter.categoryId = query.sectionId;
    if (query.section) itemFilter.section = new RegExp(`^${escapeRegex(query.section)}$`, "i");
    const matchingGroupIds = await Item.distinct("groupId", itemFilter);
    filter.$or = [{ name: regex }];
    if (matchingGroupIds.length) filter.$or.push({ _id: { $in: matchingGroupIds } });
  }
  const limit = Math.min(Math.max(Number(query.limit) || 30, 1), 100);
  const groups = await ItemGroup.find(filter).populate("categoryId", "key name")
    .sort({ section: 1, sortOrder: 1, name: 1 }).limit(limit).lean();
  return groups.map((group) => ({
    id: group._id,
    key: group.key,
    name: group.name,
    sectionId: group.categoryId?._id || group.categoryId,
    section: group.categoryId?.name || group.section,
    sortOrder: Number(group.sortOrder || 0),
    label: `${group.section} - ${group.name}`,
  }));
};

const getTriggerItems = async (query = {}) => {
  const filter = { isActive: true };
  if (query.sectionId) filter.categoryId = query.sectionId;
  if (query.groupId) filter.groupId = query.groupId;
  if (query.search?.trim()) {
    const regex = { $regex: escapeRegex(query.search.trim()), $options: "i" };
    filter.$or = [{ name: regex }, { group: regex }, { section: regex }];
  }
  const limit = Math.min(Math.max(Number(query.limit) || 500, 1), 1000);
  const items = await Item.find(filter)
    .select("key name section group groupId categoryId sortOrder")
    .populate("groupId", "key name section categoryId sortOrder")
    .populate("categoryId", "key name")
    .sort({ section: 1, group: 1, sortOrder: 1, name: 1 })
    .limit(limit)
    .lean();
  const groups = new Map();
  items.forEach((item) => {
    const group = item.groupId || {};
    const id = String(group._id || item.groupId || item.group || "ungrouped");
    if (!groups.has(id)) {
      groups.set(id, {
        id,
        name: group.name || item.group || "Ungrouped",
        sectionId: item.categoryId?._id || item.categoryId,
        section: item.categoryId?.name || item.section,
        sortOrder: Number(group.sortOrder || 0),
        items: [],
      });
    }
    groups.get(id).items.push({
      id: item._id,
      key: item.key,
      name: item.name,
      groupId: id,
      group: group.name || item.group,
      sectionId: item.categoryId?._id || item.categoryId,
      section: item.categoryId?.name || item.section,
      sortOrder: Number(item.sortOrder || 0),
    });
  });
  return [...groups.values()];
};

const getAvailableAddOns = async (query = {}) => {
  if (!SERVICE_TYPES.includes(query.serviceType)) {
    throw new ApiError(400, "serviceType must be local_shifting or intercity_moving");
  }
  const itemIds = String(query.itemIds || "").split(",").map((id) => id.trim()).filter(Boolean);
  const directGroupIds = String(query.groupIds || "").split(",").map((id) => id.trim()).filter(Boolean);
  const directCategoryIds = String(query.categoryIds || "").split(",").map((id) => id.trim()).filter(Boolean);
  if ([...itemIds, ...directGroupIds, ...directCategoryIds].some((id) => !mongoose.isValidObjectId(id))) {
    throw new ApiError(400, "itemIds/groupIds/categoryIds must contain valid MongoDB IDs");
  }
  const selectedItems = itemIds.length
    ? await Item.find({ _id: { $in: itemIds }, isActive: true }).select("groupId categoryId")
    : [];
  const selectedGroups = directGroupIds.length
    ? await ItemGroup.find({ _id: { $in: directGroupIds }, isActive: true }).select("categoryId")
    : [];
  const selectedGroupIds = [...new Set([
    ...directGroupIds,
    ...selectedItems.map((item) => String(item.groupId)),
  ])];
  const selectedCategoryIds = [...new Set([
    ...directCategoryIds,
    ...selectedItems.map((item) => String(item.categoryId)).filter(Boolean),
    ...selectedGroups.map((group) => String(group.categoryId)).filter(Boolean),
  ])];

  const addOns = await populated(AddOnService.find({
    isActive: true,
    appliesToServiceTypes: query.serviceType,
    $or: [
      { triggerCategoryIds: { $size: 0 }, triggerGroupIds: { $size: 0 }, triggerItemIds: { $size: 0 } },
      { triggerCategoryIds: { $exists: false }, triggerGroupIds: { $size: 0 }, triggerItemIds: { $size: 0 } },
      { triggerCategoryIds: { $size: 0 }, triggerGroupIds: { $size: 0 }, triggerItemIds: { $exists: false } },
      { triggerCategoryIds: { $in: selectedCategoryIds } },
      { triggerGroupIds: { $in: selectedGroupIds } },
      { triggerItemIds: { $in: itemIds } },
    ],
  })).sort({ isOptional: 1, sortOrder: 1, createdAt: -1 }).lean();

  const selectedCategorySet = new Set(selectedCategoryIds);
  const selectedSet = new Set(selectedGroupIds);
  const selectedItemSet = new Set(itemIds);
  return addOns.map((addOn) => {
    const matchedCategories = (addOn.triggerCategoryIds || []).filter((category) => selectedCategorySet.has(String(category._id)));
    const matched = (addOn.triggerGroupIds || []).filter((group) => selectedSet.has(String(group._id)));
    const matchedItems = (addOn.triggerItemIds || []).filter((item) => selectedItemSet.has(String(item._id)));
    return {
      ...addOn,
      isGlobal: !(addOn.triggerCategoryIds || []).length && !(addOn.triggerGroupIds || []).length && !(addOn.triggerItemIds || []).length,
      matchedTriggerCategoryIds: matchedCategories.map((category) => category._id),
      matchedTriggerGroupIds: matched.map((group) => group._id),
      matchedTriggerItemIds: matchedItems.map((item) => item._id),
    };
  });
};

module.exports = {
  createAddOn, getAllAddOnsForAdmin, getAddOnById, updateAddOn, deleteAddOn,
  getTriggerGroups, getTriggerItems, getAvailableAddOns,
};
