const mongoose = require("mongoose");
const Item = require("../schema/Item.model");
const ItemCategory = require("../schema/ItemCategory.model");
const ItemGroup = require("../schema/ItemGroup.model");
const ItemSize = require("../schema/ItemSize.model");
const ApiError = require("../utility/apierror");
const { notifyContentChange } = require("../utility/contentEvents");

const slugify = (value) => String(value || "").trim().toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const exactText = (value) => new RegExp(`^${escapeRegex(String(value).trim())}$`, "i");
const cleanIcon = (value) => {
  const icon = String(value || "").trim();
  return icon || null;
};
const uniqueSlug = async (Model, base, currentId = null) => {
  const root = slugify(base) || "item";
  for (let index = 0; index < 100; index += 1) {
    const key = index === 0 ? root : `${root}-${index + 1}`;
    const filter = { key };
    if (currentId) filter._id = { $ne: currentId };
    if (!(await Model.exists(filter))) return key;
  }
  throw new ApiError(409, "Unable to generate unique key");
};

const requireSection = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Valid sectionId is required");
  const section = await ItemCategory.findOne({ _id: id, isActive: true });
  if (!section) throw new ApiError(400, "Section not found or inactive");
  return section;
};

const requireGroup = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Valid groupId is required");
  const group = await ItemGroup.findOne({ _id: id, isActive: true }).populate("categoryId");
  if (!group || !group.categoryId?.isActive) throw new ApiError(400, "Group or its section is inactive");
  return group;
};

const normalizeVariants = async (variants) => {
  if (!Array.isArray(variants) || !variants.length) {
    throw new ApiError(400, "At least one item size is required");
  }
  const normalized = [];
  const used = new Set();
  for (let index = 0; index < variants.length; index += 1) {
    const variant = variants[index];
    const filter = variant.sizeId
      ? { _id: variant.sizeId, isActive: true }
      : { key: String(variant.sizeKey || "").toUpperCase(), isActive: true };
    const size = await ItemSize.findOne(filter);
    if (!size) throw new ApiError(400, `Invalid or inactive size at index ${index}`);
    if (used.has(String(size._id))) throw new ApiError(400, `Duplicate size: ${size.key}`);
    const price = Number(variant.price);
    if (!Number.isFinite(price) || price < 0) throw new ApiError(400, `Invalid price for size ${size.key}`);
    used.add(String(size._id));
    normalized.push({
      sizeId: size._id,
      sizeKey: size.key,
      label: size.label,
      price,
      isActive: variant.isActive !== false,
      sortOrder: Number.isFinite(Number(variant.sortOrder)) ? Number(variant.sortOrder) : index,
    });
  }
  return normalized;
};

const normalizeItemPayload = async (payload, current = null) => {
  const update = { ...payload };
  const group = await requireGroup(update.groupId || current?.groupId);
  if (update.categoryId && String(update.categoryId) !== String(group.categoryId._id)) {
    throw new ApiError(400, "Selected group does not belong to selected section");
  }
  update.groupId = group._id;
  update.group = group.name;
  update.categoryId = group.categoryId._id;
  update.section = group.categoryId.name;
  if (update.sizes !== undefined) update.sizes = await normalizeVariants(update.sizes);
  if (update.icon !== undefined) update.icon = cleanIcon(update.icon);
  if (!current && update.sizes === undefined) throw new ApiError(400, "sizes is required");
  if (!current) update.key = await uniqueSlug(Item, update.key || `${update.section}-${update.group}-${update.name}`);
  else if (update.key !== undefined) update.key = await uniqueSlug(Item, update.key, current._id);
  delete update.sizeTag;
  delete update.price;
  return update;
};

const itemFilter = (query = {}, publicOnly = false) => {
  const filter = {};
  if (query.sectionId || query.categoryId) filter.categoryId = query.sectionId || query.categoryId;
  if (query.groupId) filter.groupId = query.groupId;
  if (query.section) filter.section = exactText(query.section);
  if (query.group) filter.group = exactText(query.group);
  if (query.size || query.sizeTag) filter["sizes.sizeKey"] = String(query.size || query.sizeTag).toUpperCase();
  if (query.search) filter.name = { $regex: escapeRegex(query.search), $options: "i" };
  if (publicOnly || query.isActive === "true") filter.isActive = true;
  if (!publicOnly && query.isActive === "false") filter.isActive = false;
  return filter;
};

const getItems = (query = {}, publicOnly = false) => Item.find(itemFilter(query, publicOnly))
  .populate("categoryId", "key name icon isActive sortOrder")
  .populate("groupId", "key name icon isActive sortOrder")
  .populate("sizes.sizeId", "key label description isActive sortOrder")
  .sort({ section: 1, group: 1, sortOrder: 1, name: 1 });

const publicItemSelect = "key categoryId section groupId group name icon sizes sortOrder";
const publicSectionSelect = "key name icon sortOrder";
const publicGroupSelect = "key categoryId section name icon sortOrder";
const activeVariant = (variant) => variant.isActive !== false;
const publicItemShape = (item) => ({
  ...item,
  sizes: (item.sizes || []).filter(activeVariant).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
});

const getCatalog = async (query = {}, publicOnly = false) => {
  const sectionFilter = {};
  if (query.sectionId || query.categoryId) sectionFilter._id = query.sectionId || query.categoryId;
  if (query.section) sectionFilter.name = exactText(query.section);
  if (publicOnly || query.isActive === "true") sectionFilter.isActive = true;
  if (!publicOnly && query.isActive === "false") sectionFilter.isActive = false;
  const sectionsQuery = ItemCategory.find(sectionFilter).sort({ sortOrder: 1, name: 1 });
  if (publicOnly) sectionsQuery.select(publicSectionSelect);
  const sections = await sectionsQuery.lean();
  const sectionIds = sections.map((section) => section._id);

  const groupFilter = { categoryId: { $in: sectionIds } };
  if (query.groupId) groupFilter._id = query.groupId;
  if (query.group) groupFilter.name = exactText(query.group);
  if (publicOnly || query.isActive === "true") groupFilter.isActive = true;
  if (!publicOnly && query.isActive === "false") groupFilter.isActive = false;
  const groupsQuery = ItemGroup.find(groupFilter).sort({ sortOrder: 1, name: 1 });
  if (publicOnly) groupsQuery.select(publicGroupSelect);
  const groups = await groupsQuery.lean();
  const groupIds = groups.map((group) => group._id);

  const itemQuery = { ...query };
  delete itemQuery.group;
  const itemMongoFilter = itemFilter(itemQuery, publicOnly);
  itemMongoFilter.groupId = { $in: groupIds };
  const itemsQuery = Item.find(itemMongoFilter).sort({ sortOrder: 1, name: 1 });
  if (publicOnly) itemsQuery.select(publicItemSelect);
  else itemsQuery.populate("sizes.sizeId", "key label description isActive sortOrder");
  const items = await itemsQuery.lean();

  const itemsByGroup = new Map();
  items.forEach((item) => {
    const id = String(item.groupId);
    if (!itemsByGroup.has(id)) itemsByGroup.set(id, []);
    itemsByGroup.get(id).push(publicOnly ? publicItemShape(item) : item);
  });
  const groupsBySection = new Map();
  groups.forEach((group) => {
    const nested = { ...group, items: itemsByGroup.get(String(group._id)) || [] };
    if (publicOnly && !nested.items.length) return;
    const id = String(group.categoryId);
    if (!groupsBySection.has(id)) groupsBySection.set(id, []);
    groupsBySection.get(id).push(nested);
  });

  return sections.map((section) => ({
    ...section,
    section: section.name,
    groups: groupsBySection.get(String(section._id)) || [],
  })).filter((section) => !publicOnly || section.groups.length);
};

const createItem = async (payload) => {
  const item = await Item.create(await normalizeItemPayload(payload));
  notifyContentChange("catalog", "item:create", { id: item._id });
  return item;
};
const updateItem = async (id, payload) => {
  const current = await Item.findById(id);
  if (!current) throw new ApiError(404, "Item not found");
  const item = await Item.findByIdAndUpdate(id, { $set: await normalizeItemPayload(payload, current) },
    { new: true, runValidators: true });
  notifyContentChange("catalog", "item:update", { id });
  return item;
};
const deleteItem = async (id) => {
  const item = await Item.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
  if (!item) throw new ApiError(404, "Item not found");
  notifyContentChange("catalog", "item:delete", { id });
  return item;
};
const reorderItems = async (groupId, orderedIds = []) => {
  const group = await requireGroup(groupId);
  const ids = [...new Set((orderedIds || []).map(String))];
  if (!ids.length || ids.some((id) => !mongoose.isValidObjectId(id))) throw new ApiError(400, "Valid ordered item IDs are required");
  const count = await Item.countDocuments({ _id: { $in: ids }, groupId: group._id });
  if (count !== ids.length) throw new ApiError(400, "One or more items do not belong to this group");
  await Item.bulkWrite(ids.map((id, index) => ({
    updateOne: { filter: { _id: id, groupId: group._id }, update: { $set: { sortOrder: index } } },
  })));
  notifyContentChange("catalog", "items:reorder", { groupId });
  return getItems({ groupId: group._id });
};

const getSections = (query = {}, publicOnly = false) => {
  const filter = {};
  if (publicOnly || query.isActive === "true") filter.isActive = true;
  if (!publicOnly && query.isActive === "false") filter.isActive = false;
  return ItemCategory.find(filter).sort({ sortOrder: 1, name: 1 });
};
const createSection = async (payload) => {
  const section = await ItemCategory.create({ ...payload, icon: cleanIcon(payload.icon), key: slugify(payload.key || payload.name) });
  notifyContentChange("catalog", "section:create", { id: section._id });
  return section;
};
const updateSection = async (id, payload) => {
  const current = await ItemCategory.findById(id);
  if (!current) throw new ApiError(404, "Section not found");
  const update = { ...payload };
  if (update.key !== undefined) update.key = slugify(update.key);
  if (update.icon !== undefined) update.icon = cleanIcon(update.icon);
  const section = await ItemCategory.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  const groupUpdate = {};
  const itemUpdate = {};
  if (update.name) {
    groupUpdate.section = update.name;
    itemUpdate.section = update.name;
  }
  if (update.icon !== undefined && update.icon !== current.icon) {
    groupUpdate.icon = update.icon;
    itemUpdate.icon = update.icon;
  }
  await Promise.all([
    Object.keys(groupUpdate).length ? ItemGroup.updateMany({ categoryId: id }, { $set: groupUpdate }) : null,
    Object.keys(itemUpdate).length ? Item.updateMany({ categoryId: id }, { $set: itemUpdate }) : null,
  ].filter(Boolean));
  notifyContentChange("catalog", "section:update", { id });
  return section;
};
const deleteSection = async (id) => {
  const section = await ItemCategory.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
  if (!section) throw new ApiError(404, "Section not found");
  await Promise.all([
    ItemGroup.updateMany({ categoryId: id }, { $set: { isActive: false } }),
    Item.updateMany({ categoryId: id }, { $set: { isActive: false } }),
  ]);
  notifyContentChange("catalog", "section:delete", { id });
  return section;
};

const getGroups = (query = {}, publicOnly = false) => {
  const filter = {};
  if (query.sectionId || query.categoryId) filter.categoryId = query.sectionId || query.categoryId;
  if (query.section) filter.section = exactText(query.section);
  if (query.search) filter.name = { $regex: escapeRegex(query.search), $options: "i" };
  if (publicOnly || query.isActive === "true") filter.isActive = true;
  if (!publicOnly && query.isActive === "false") filter.isActive = false;
  return ItemGroup.find(filter).populate("categoryId", "key name isActive").sort({ section: 1, sortOrder: 1, name: 1 });
};
const createGroup = async (payload) => {
  const section = await requireSection(payload.sectionId || payload.categoryId);
  const group = await ItemGroup.create({ ...payload, icon: cleanIcon(payload.icon), categoryId: section._id, section: section.name,
    key: slugify(payload.key || payload.name) });
  notifyContentChange("catalog", "group:create", { id: group._id });
  return group;
};
const updateGroup = async (id, payload) => {
  const current = await ItemGroup.findById(id);
  if (!current) throw new ApiError(404, "Group not found");
  const update = { ...payload };
  const section = payload.sectionId || payload.categoryId
    ? await requireSection(payload.sectionId || payload.categoryId)
    : await requireSection(current.categoryId);
  update.categoryId = section._id;
  update.section = section.name;
  if (update.key !== undefined) update.key = slugify(update.key);
  if (update.icon !== undefined) update.icon = cleanIcon(update.icon);
  const group = await ItemGroup.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  const itemUpdate = { group: group.name, categoryId: section._id, section: section.name };
  if (update.icon !== undefined && update.icon !== current.icon) itemUpdate.icon = update.icon;
  await Item.updateMany({ groupId: id }, { $set: itemUpdate });
  notifyContentChange("catalog", "group:update", { id });
  return group;
};
const deleteGroup = async (id) => {
  const group = await ItemGroup.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
  if (!group) throw new ApiError(404, "Group not found");
  await Item.updateMany({ groupId: id }, { $set: { isActive: false } });
  notifyContentChange("catalog", "group:delete", { id });
  return group;
};
const reorderGroups = async (sectionId, orderedIds = []) => {
  const section = await requireSection(sectionId);
  const ids = [...new Set((orderedIds || []).map(String))];
  if (!ids.length || ids.some((id) => !mongoose.isValidObjectId(id))) throw new ApiError(400, "Valid ordered group IDs are required");
  const count = await ItemGroup.countDocuments({ _id: { $in: ids }, categoryId: section._id });
  if (count !== ids.length) throw new ApiError(400, "One or more groups do not belong to this section");
  await ItemGroup.bulkWrite(ids.map((id, index) => ({
    updateOne: { filter: { _id: id, categoryId: section._id }, update: { $set: { sortOrder: index } } },
  })));
  notifyContentChange("catalog", "groups:reorder", { sectionId });
  return getGroups({ sectionId: section._id });
};

const getSizes = (query = {}, publicOnly = false) => {
  const filter = {};
  if (publicOnly || query.isActive === "true") filter.isActive = true;
  if (!publicOnly && query.isActive === "false") filter.isActive = false;
  return ItemSize.find(filter).sort({ sortOrder: 1, key: 1 });
};
const createSize = async (payload) => {
  const size = await ItemSize.create({ ...payload,
    key: String(payload.key || payload.label || "").trim().toUpperCase() });
  notifyContentChange("catalog", "size:create", { id: size._id });
  return size;
};
const updateSize = async (id, payload) => {
  const current = await ItemSize.findById(id);
  if (!current) throw new ApiError(404, "Item size not found");
  const update = { ...payload };
  if (update.key !== undefined) update.key = String(update.key).trim().toUpperCase();
  const size = await ItemSize.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  await Item.updateMany({ "sizes.sizeId": id }, { $set: {
    "sizes.$[variant].sizeKey": size.key,
    "sizes.$[variant].label": size.label,
  } }, { arrayFilters: [{ "variant.sizeId": id }] });
  notifyContentChange("catalog", "size:update", { id });
  return size;
};
const deleteSize = async (id) => {
  const size = await ItemSize.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
  if (!size) throw new ApiError(404, "Item size not found");
  await Item.updateMany({ "sizes.sizeId": id }, { $set: { "sizes.$[variant].isActive": false } },
    { arrayFilters: [{ "variant.sizeId": id }] });
  notifyContentChange("catalog", "size:delete", { id });
  return size;
};

module.exports = {
  getItems, getCatalog, createItem, updateItem, deleteItem,
  getSections, createSection, updateSection, deleteSection,
  getGroups, createGroup, updateGroup, deleteGroup, reorderGroups, reorderItems,
  getSizes, createSize, updateSize, deleteSize, slugify,
};
