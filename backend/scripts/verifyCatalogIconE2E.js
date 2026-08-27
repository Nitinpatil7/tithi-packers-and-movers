const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { r2Client, bucketName } = require("../config/r2Client");
const Admin = require("../schema/Admin.model");
const AdminSession = require("../schema/AdminSession.model");
const Item = require("../schema/Item.model");
const ItemCategory = require("../schema/ItemCategory.model");
const ItemGroup = require("../schema/ItemGroup.model");
const ItemSize = require("../schema/ItemSize.model");

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/axO9qkAAAAASUVORK5CYII=",
  "base64",
);
const apiBase = (process.env.ICON_VERIFY_API_URL || "http://localhost:5000").replace(/\/$/, "");
const websiteBase = (process.env.ICON_VERIFY_WEBSITE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const cdnBase = String(process.env.NEXT_PUBLIC_ICON_CDN || "").replace(/\/$/, "");
const runId = `catalog-icon-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
const results = [];
const cleanup = { admins: [], sessions: [], sections: [], groups: [], items: [], sizes: [], r2Keys: [] };

const pass = (name, detail = "") => results.push({ status: "PASS", name, detail });
const fail = (name, detail = "") => results.push({ status: "FAIL", name, detail });
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const expect = (condition, name, detail) => {
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ""}`);
};
const readJson = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
};

const uploadTinyIcon = async (name) => {
  const key = `icons/${runId}-${name}-png`;
  await r2Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: tinyPng,
    ContentType: "image/png",
  }));
  cleanup.r2Keys.push(key);
  return `${cdnBase}/${key}`;
};

const createAdminSession = async () => {
  const admin = await Admin.create({
    name: "Catalog Icon Verify Admin",
    email: `${runId}@example.test`,
    passwordHash: await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 12),
    role: "super_admin",
    isActive: true,
    mustChangePassword: false,
  });
  cleanup.admins.push(admin._id);
  const token = crypto.randomBytes(48).toString("hex");
  const session = await AdminSession.create({
    adminId: admin._id,
    tokenHash: hashToken(token),
    ip: "127.0.0.1",
    userAgent: "catalog-icon-e2e",
    accessExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
  });
  cleanup.sessions.push(session._id);
  return token;
};

const createCatalogFixture = async () => {
  const size = await ItemSize.create({
    key: `C${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    label: "Catalog Icon Verify Size",
    isActive: true,
  });
  cleanup.sizes.push(size._id);

  const section = await ItemCategory.create({
    key: `${runId}-section`,
    name: `Catalog Icon Verify Section ${runId}`,
    icon: null,
    isActive: true,
    sortOrder: 9999,
  });
  cleanup.sections.push(section._id);

  const groupA = await ItemGroup.create({
    key: `${runId}-group-a`,
    categoryId: section._id,
    section: section.name,
    name: `Catalog Icon Verify Group A ${runId}`,
    icon: null,
    isActive: true,
    sortOrder: 0,
  });
  const groupB = await ItemGroup.create({
    key: `${runId}-group-b`,
    categoryId: section._id,
    section: section.name,
    name: `Catalog Icon Verify Group B ${runId}`,
    icon: null,
    isActive: true,
    sortOrder: 1,
  });
  cleanup.groups.push(groupA._id, groupB._id);

  const sizeVariant = {
    sizeId: size._id,
    sizeKey: size.key,
    label: size.label,
    price: 1,
    isActive: true,
    sortOrder: 0,
  };
  const itemA = await Item.create({
    key: `${runId}-item-a`,
    categoryId: section._id,
    section: section.name,
    groupId: groupA._id,
    group: groupA.name,
    name: `Catalog Icon Verify Item A ${runId}`,
    icon: null,
    sizes: [sizeVariant],
    isActive: true,
    sortOrder: 0,
  });
  const itemB = await Item.create({
    key: `${runId}-item-b`,
    categoryId: section._id,
    section: section.name,
    groupId: groupB._id,
    group: groupB.name,
    name: `Catalog Icon Verify Item B ${runId}`,
    icon: null,
    sizes: [sizeVariant],
    isActive: true,
    sortOrder: 0,
  });
  cleanup.items.push(itemA._id, itemB._id);
  return { section, groupA, groupB, itemA, itemB };
};

const patchAdmin = async (pathName, token, body) => {
  const response = await fetch(`${apiBase}${pathName}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await readJson(response);
  expect(response.ok, pathName, `status ${response.status}: ${payload.message || payload.raw || ""}`);
  return payload;
};

const publicCatalogFixture = async (sectionId) => {
  const response = await fetch(`${apiBase}/api/items/catalog`);
  const payload = await readJson(response);
  expect(response.ok, "public catalog API", `status ${response.status}`);
  const sections = Array.isArray(payload.data) ? payload.data : [];
  return sections.find((section) => String(section._id) === String(sectionId));
};

const verifyNextImage = async (iconUrl, label) => {
  const imageUrl = `${websiteBase}/_next/image?url=${encodeURIComponent(iconUrl)}&w=64&q=75`;
  let last = null;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(imageUrl);
      const type = response.headers.get("content-type") || "";
      last = `${response.status} ${type || "empty"}`;
      if (response.status === 200 && type.includes("image/")) {
        pass(`${label} next/image`, last);
        return;
      }
    } catch (error) {
      last = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  throw new Error(`${label} next/image: ${last || "no response"}`);
};

const cleanupAll = async () => {
  await Item.deleteMany({ _id: { $in: cleanup.items } });
  await ItemGroup.deleteMany({ _id: { $in: cleanup.groups } });
  await ItemCategory.deleteMany({ _id: { $in: cleanup.sections } });
  await ItemSize.deleteMany({ _id: { $in: cleanup.sizes } });
  await AdminSession.deleteMany({ _id: { $in: cleanup.sessions } });
  await Admin.deleteMany({ _id: { $in: cleanup.admins } });
  for (const key of cleanup.r2Keys) {
    await r2Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
  }
};

const main = async () => {
  try {
    expect(process.env.MONGO_URI, "MONGO_URI", "is required");
    expect(cdnBase, "NEXT_PUBLIC_ICON_CDN", "is required");
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    pass("MongoDB connection", mongoose.connection.name);

    const token = await createAdminSession();
    const fixture = await createCatalogFixture();
    const sectionIcon = await uploadTinyIcon("section");
    const groupIcon = await uploadTinyIcon("group");

    await patchAdmin(`/api/items/admin/sections/${fixture.section._id}`, token, { icon: sectionIcon });
    const groupsAfterSection = await ItemGroup.find({ _id: { $in: [fixture.groupA._id, fixture.groupB._id] } }).lean();
    const itemsAfterSection = await Item.find({ _id: { $in: [fixture.itemA._id, fixture.itemB._id] } }).lean();
    expect(groupsAfterSection.every((group) => group.icon === sectionIcon), "section DB cascade", "groups did not inherit section icon");
    expect(itemsAfterSection.every((item) => item.icon === sectionIcon), "section DB cascade", "items did not inherit section icon");
    pass("section DB cascade", "section icon reached groups and items");

    let publicSection = await publicCatalogFixture(fixture.section._id);
    expect(publicSection?.icon === sectionIcon, "public section icon", "missing from API response");
    expect(publicSection.groups?.every((group) => group.icon === sectionIcon), "public group icons", "missing from API response");
    expect(publicSection.groups?.every((group) => group.items?.every((item) => item.icon === sectionIcon)), "public item icons", "missing from API response");
    pass("public section/group/item icons", "public catalog API includes all three levels");
    await verifyNextImage(sectionIcon, "section icon");

    await patchAdmin(`/api/items/admin/groups/${fixture.groupA._id}`, token, { icon: groupIcon });
    const itemAAfterGroup = await Item.findById(fixture.itemA._id).lean();
    const itemBAfterGroup = await Item.findById(fixture.itemB._id).lean();
    const groupAAfterGroup = await ItemGroup.findById(fixture.groupA._id).lean();
    const groupBAfterGroup = await ItemGroup.findById(fixture.groupB._id).lean();
    expect(groupAAfterGroup.icon === groupIcon, "group DB update", "target group did not receive group icon");
    expect(groupBAfterGroup.icon === sectionIcon, "group DB isolation", "sibling group changed unexpectedly");
    expect(itemAAfterGroup.icon === groupIcon, "group DB cascade", "target item did not inherit group icon");
    expect(itemBAfterGroup.icon === sectionIcon, "group DB isolation", "sibling item changed unexpectedly");
    pass("group DB cascade", "only target group item changed");

    publicSection = await publicCatalogFixture(fixture.section._id);
    const publicGroupA = publicSection.groups.find((group) => String(group._id) === String(fixture.groupA._id));
    const publicGroupB = publicSection.groups.find((group) => String(group._id) === String(fixture.groupB._id));
    expect(publicGroupA?.icon === groupIcon, "public group icon update", "target group missing icon");
    expect(publicGroupB?.icon === sectionIcon, "public group icon isolation", "sibling group changed unexpectedly");
    expect(publicGroupA?.items?.every((item) => item.icon === groupIcon), "public group item icons", "target group items missing icon");
    expect(publicGroupB?.items?.every((item) => item.icon === sectionIcon), "public group item isolation", "sibling group items changed unexpectedly");
    pass("public group/item icon update", "public catalog API reflects group cascade");
    await verifyNextImage(groupIcon, "group icon");
  } catch (error) {
    fail("verification stopped", error.message);
    process.exitCode = 1;
  } finally {
    try {
      await cleanupAll();
      pass("cleanup", "temporary DB rows and R2 objects removed");
    } catch (error) {
      fail("cleanup", error.message);
    }
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    console.log("\nCatalog icon E2E verification results:");
    results.forEach((result) => {
      console.log(`[${result.status}] ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
    });
  }
};

main();
