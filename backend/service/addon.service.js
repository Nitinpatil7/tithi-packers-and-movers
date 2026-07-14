const mongoose = require("mongoose");
const AddOnService = require("../schema/Addonservice.model");
const Item = require("../schema/Item.model");
const ItemGroup = require("../schema/ItemGroup.model");
require("../schema/ItemCategory.model");
const ApiError = require("../utility/apierror");

const SERVICE_TYPES = ["local_shifting", "intercity_moving"];
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeTriggers = async (payload) => {
  const normalized = { ...payload };
  if (payload.triggerGroupIds === undefined) return normalized;
  const ids = [...new Set((payload.triggerGroupIds || []).map(String))];
  if (ids.some((id) => !mongoose.isValidObjectId(id))) throw new ApiError(400, "Invalid trigger group ID");
  const groups = await ItemGroup.find({ _id: { $in: ids }, isActive: true });
  if (groups.length !== ids.length) throw new ApiError(400, "One or more trigger groups are invalid or inactive");
  normalized.triggerGroupIds = groups.map((group) => group._id);
  return normalized;
};

const populated = (query) => query.populate({
  path: "triggerGroupIds",
  select: "key name section categoryId description isActive sortOrder",
  populate: { path: "categoryId", select: "key name isActive" },
});

const createAddOn = async (payload) => {
  const addOn = await AddOnService.create(await normalizeTriggers(payload));
  return addOn.populate({ path: "triggerGroupIds", populate: { path: "categoryId", select: "key name" } });
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
  if (query.search?.trim()) filter.name = { $regex: escapeRegex(query.search.trim()), $options: "i" };
  const limit = Math.min(Math.max(Number(query.limit) || 30, 1), 100);
  const groups = await ItemGroup.find(filter).populate("categoryId", "key name")
    .sort({ section: 1, sortOrder: 1, name: 1 }).limit(limit).lean();
  return groups.map((group) => ({
    id: group._id,
    key: group.key,
    name: group.name,
    sectionId: group.categoryId?._id || group.categoryId,
    section: group.categoryId?.name || group.section,
    label: `${group.section} - ${group.name}`,
  }));
};

const getAvailableAddOns = async (query = {}) => {
  if (!SERVICE_TYPES.includes(query.serviceType)) {
    throw new ApiError(400, "serviceType must be local_shifting or intercity_moving");
  }
  const itemIds = String(query.itemIds || "").split(",").map((id) => id.trim()).filter(Boolean);
  const directGroupIds = String(query.groupIds || "").split(",").map((id) => id.trim()).filter(Boolean);
  if ([...itemIds, ...directGroupIds].some((id) => !mongoose.isValidObjectId(id))) {
    throw new ApiError(400, "itemIds/groupIds must contain valid MongoDB IDs");
  }
  const selectedItems = itemIds.length
    ? await Item.find({ _id: { $in: itemIds }, isActive: true }).select("groupId")
    : [];
  const selectedGroupIds = [...new Set([
    ...directGroupIds,
    ...selectedItems.map((item) => String(item.groupId)),
  ])];

  const addOns = await populated(AddOnService.find({
    isActive: true,
    appliesToServiceTypes: query.serviceType,
    $or: [
      { triggerGroupIds: { $size: 0 } },
      { triggerGroupIds: { $in: selectedGroupIds } },
    ],
  })).sort({ isOptional: 1, sortOrder: 1, createdAt: -1 }).lean();

  const selectedSet = new Set(selectedGroupIds);
  return addOns.map((addOn) => {
    const matched = (addOn.triggerGroupIds || []).filter((group) => selectedSet.has(String(group._id)));
    return {
      ...addOn,
      isGlobal: !(addOn.triggerGroupIds || []).length,
      matchedTriggerGroupIds: matched.map((group) => group._id),
    };
  });
};

module.exports = {
  createAddOn, getAllAddOnsForAdmin, getAddOnById, updateAddOn, deleteAddOn,
  getTriggerGroups, getAvailableAddOns,
};
