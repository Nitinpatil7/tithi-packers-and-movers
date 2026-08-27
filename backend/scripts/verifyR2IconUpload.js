const path = require("path");
const http = require("http");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { r2Client, bucketName } = require("../config/r2Client");
const app = require("../app");
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
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const cdnBase = String(process.env.NEXT_PUBLIC_ICON_CDN || "").replace(/\/$/, "");
const mongoUri = process.env.MONGO_URI;
const runId = `verify-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
const results = [];
const createdObjectKeys = new Set();

const pass = (name, detail = "") => results.push({ status: "PASS", name, detail });
const fail = (name, detail = "") => results.push({ status: "FAIL", name, detail });
const skip = (name, detail = "") => results.push({ status: "SKIP", name, detail });

const readJson = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
};

const expect = (condition, name, detail) => {
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ""}`);
};

const publicUrlFor = (key) => `${cdnBase}/${key}`;

const fetchImage = async (url, attempts = 6) => {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url);
    last = {
      status: response.status,
      contentType: response.headers.get("content-type") || "",
    };
    if (response.ok) return last;
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  return last;
};

const deleteR2Object = async (key) => {
  await r2Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
  createdObjectKeys.delete(key);
};

const keyFromPublicUrl = (url) => {
  const parsed = new URL(url);
  return parsed.pathname.replace(/^\/+/, "");
};

const directR2UploadTest = async () => {
  const key = `icons/${runId}-direct-png`;
  await r2Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: tinyPng,
    ContentType: "image/png",
  }));
  createdObjectKeys.add(key);
  const url = publicUrlFor(key);
  pass("direct R2 upload", `uploaded ${url}`);

  const fetched = await fetchImage(url);
  expect(fetched.status === 200, "direct public fetch", `expected 200, got ${fetched.status}`);
  expect(fetched.contentType.includes("image/png"), "direct public fetch", `expected image/png, got ${fetched.contentType || "empty"}`);
  pass("direct public fetch", `200 ${fetched.contentType}`);

  await deleteR2Object(key);
  pass("direct R2 cleanup", `deleted ${key}`);
};

const connectMongo = async () => {
  if (!mongoUri) throw new Error("MONGO_URI is not configured");
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
};

const createAdminSession = async () => {
  const admin = await Admin.create({
    name: "R2 Icon Verify Admin",
    email: `${runId}@example.test`,
    passwordHash: await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 12),
    role: "super_admin",
    isActive: true,
    mustChangePassword: false,
  });
  const token = crypto.randomBytes(48).toString("hex");
  const session = await AdminSession.create({
    adminId: admin._id,
    tokenHash: hashToken(token),
    ip: "127.0.0.1",
    userAgent: "r2-icon-verifier",
    accessExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
  });
  return { admin, session, token };
};

const listen = (server) => new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const { port } = server.address();
    resolve(`http://127.0.0.1:${port}`);
  });
});

const close = (server) => new Promise((resolve) => server.close(resolve));

const postIcon = async (baseUrl, token, file, filename, contentType) => {
  const formData = new FormData();
  formData.append("icon", new Blob([file], { type: contentType }), filename);
  return fetch(`${baseUrl}/api/admin/icons/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Origin: "http://localhost:3001",
    },
    body: formData,
  });
};

const endpointTests = async () => {
  await connectMongo();
  pass("MongoDB connection", mongoose.connection.name);

  const { admin, session, token } = await createAdminSession();
  const server = http.createServer(app);
  const baseUrl = await listen(server);
  let uploadedUrl = null;

  try {
    const preflight = await fetch(`${baseUrl}/api/admin/icons/upload`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3001",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type",
      },
    });
    const allowOrigin = preflight.headers.get("access-control-allow-origin") || "";
    expect([200, 204].includes(preflight.status), "CORS preflight", `status ${preflight.status}`);
    expect(allowOrigin === "http://localhost:3001", "CORS preflight", `allow-origin ${allowOrigin || "empty"}`);
    pass("CORS preflight", `${preflight.status} allow-origin=${allowOrigin}`);

    const unauthForm = new FormData();
    unauthForm.append("icon", new Blob([tinyPng], { type: "image/png" }), "icon.png");
    const unauth = await fetch(`${baseUrl}/api/admin/icons/upload`, { method: "POST", body: unauthForm });
    const unauthPayload = await readJson(unauth);
    expect(unauth.status === 401, "admin auth required", `expected 401, got ${unauth.status}`);
    pass("admin auth required", unauthPayload.message || "401");

    const valid = await postIcon(baseUrl, token, tinyPng, "icon.png", "image/png");
    const validPayload = await readJson(valid);
    uploadedUrl = validPayload.data?.icon || validPayload.icon;
    expect(valid.status === 201, "valid multipart upload", `expected 201, got ${valid.status}: ${validPayload.message || ""}`);
    expect(uploadedUrl && uploadedUrl.startsWith(`${cdnBase}/icons/`), "valid multipart upload", `unexpected URL ${uploadedUrl || "empty"}`);
    createdObjectKeys.add(keyFromPublicUrl(uploadedUrl));
    pass("valid multipart upload", uploadedUrl);

    const fetched = await fetchImage(uploadedUrl);
    expect(fetched.status === 200, "endpoint public fetch", `expected 200, got ${fetched.status}`);
    expect(fetched.contentType.includes("image/png"), "endpoint public fetch", `expected image/png, got ${fetched.contentType || "empty"}`);
    pass("endpoint public fetch", `200 ${fetched.contentType}`);

    const oversized = await postIcon(baseUrl, token, Buffer.alloc(501 * 1024), "large.png", "image/png");
    const oversizedPayload = await readJson(oversized);
    expect(oversized.status === 400, "oversized upload rejection", `expected 400, got ${oversized.status}`);
    expect(/500 KB|smaller/i.test(oversizedPayload.message || ""), "oversized upload rejection", oversizedPayload.message || "missing message");
    pass("oversized upload rejection", oversizedPayload.message);

    const invalidType = await postIcon(baseUrl, token, Buffer.from("not an image"), "icon.txt", "text/plain");
    const invalidPayload = await readJson(invalidType);
    expect(invalidType.status === 400, "non-image rejection", `expected 400, got ${invalidType.status}`);
    expect(/PNG|JPEG|image/i.test(invalidPayload.message || ""), "non-image rejection", invalidPayload.message || "missing message");
    pass("non-image rejection", invalidPayload.message);
  } finally {
    await close(server);
    await AdminSession.deleteOne({ _id: session._id });
    await Admin.deleteOne({ _id: admin._id });
  }

  return { token, uploadedUrl };
};

const cascadeTests = async (sectionIconUrl) => {
  const sectionIcon = sectionIconUrl || publicUrlFor(`icons/${runId}-cascade-section-png`);
  const groupIcon = publicUrlFor(`icons/${runId}-cascade-group-png`);
  const cleanup = { categories: [], groups: [], items: [], sizes: [] };

  const { admin, session, token } = await createAdminSession();
  const server = http.createServer(app);
  const baseUrl = await listen(server);

  try {
    const size = await ItemSize.create({
      key: `V${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      label: "Verify Size",
      isActive: true,
    });
    cleanup.sizes.push(size._id);

    const category = await ItemCategory.create({
      key: `${runId}-section`,
      name: `Verify Section ${runId}`,
      icon: null,
      isActive: true,
    });
    cleanup.categories.push(category._id);

    const groupA = await ItemGroup.create({
      key: `${runId}-group-a`,
      categoryId: category._id,
      section: category.name,
      name: `Verify Group A ${runId}`,
      icon: null,
      isActive: true,
    });
    const groupB = await ItemGroup.create({
      key: `${runId}-group-b`,
      categoryId: category._id,
      section: category.name,
      name: `Verify Group B ${runId}`,
      icon: null,
      isActive: true,
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
      categoryId: category._id,
      section: category.name,
      groupId: groupA._id,
      group: groupA.name,
      name: `Verify Item A ${runId}`,
      icon: null,
      sizes: [sizeVariant],
      isActive: true,
    });
    const itemB = await Item.create({
      key: `${runId}-item-b`,
      categoryId: category._id,
      section: category.name,
      groupId: groupB._id,
      group: groupB.name,
      name: `Verify Item B ${runId}`,
      icon: null,
      sizes: [sizeVariant],
      isActive: true,
    });
    cleanup.items.push(itemA._id, itemB._id);

    const sectionResponse = await fetch(`${baseUrl}/api/items/admin/sections/${category._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ icon: sectionIcon }),
    });
    const sectionPayload = await readJson(sectionResponse);
    expect(sectionResponse.status === 200, "section cascade route", `expected 200, got ${sectionResponse.status}: ${sectionPayload.message || ""}`);

    const groupsAfterSection = await ItemGroup.find({ _id: { $in: cleanup.groups } }).lean();
    const itemsAfterSection = await Item.find({ _id: { $in: cleanup.items } }).lean();
    expect(groupsAfterSection.every((group) => group.icon === sectionIcon), "section cascade groups", "not all groups received section icon");
    expect(itemsAfterSection.every((item) => item.icon === sectionIcon), "section cascade items", "not all items received section icon");
    pass("section cascade", "groups and items updated");

    const groupResponse = await fetch(`${baseUrl}/api/items/admin/groups/${groupA._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ icon: groupIcon }),
    });
    const groupPayload = await readJson(groupResponse);
    expect(groupResponse.status === 200, "group cascade route", `expected 200, got ${groupResponse.status}: ${groupPayload.message || ""}`);

    const itemAAfterGroup = await Item.findById(itemA._id).lean();
    const itemBAfterGroup = await Item.findById(itemB._id).lean();
    expect(itemAAfterGroup.icon === groupIcon, "group cascade target item", `expected ${groupIcon}, got ${itemAAfterGroup.icon}`);
    expect(itemBAfterGroup.icon === sectionIcon, "group cascade isolation", "item in another group should keep section icon");
    pass("group cascade", "only target group's item changed");
  } finally {
    await close(server);
    await AdminSession.deleteOne({ _id: session._id });
    await Admin.deleteOne({ _id: admin._id });
    await Item.deleteMany({ _id: { $in: cleanup.items } });
    await ItemGroup.deleteMany({ _id: { $in: cleanup.groups } });
    await ItemCategory.deleteMany({ _id: { $in: cleanup.categories } });
    await ItemSize.deleteMany({ _id: { $in: cleanup.sizes } });
  }
};

const main = async () => {
  try {
    expect(cdnBase, "NEXT_PUBLIC_ICON_CDN", "is required");
    pass("R2 client initialization", `bucket=${bucketName}`);

    await directR2UploadTest();
    const { uploadedUrl } = await endpointTests();
    await cascadeTests(uploadedUrl);
  } catch (error) {
    fail("verification stopped", error.message);
    process.exitCode = 1;
  } finally {
    for (const key of [...createdObjectKeys]) {
      try {
        await deleteR2Object(key);
        pass("R2 cleanup", `deleted ${key}`);
      } catch (error) {
        fail("R2 cleanup", `could not delete ${key}: ${error.message}`);
      }
    }
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    console.log("\nR2 icon verification results:");
    results.forEach((result) => {
      console.log(`[${result.status}] ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
    });
  }
};

main();
