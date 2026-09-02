const path = require("path");
const { randomUUID } = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const ApiError = require("../utility/apierror");
const logger = require("../utility/logger");
const { r2Client, bucketName } = require("../config/r2Client");

let sharp;
try {
  sharp = require("sharp");
} catch (error) {
  try {
    sharp = require(path.resolve(__dirname, "../../frontend/node_modules/sharp"));
  } catch (_) {
    sharp = null;
  }
}

const COMPLETION_PROOF_MAX_BYTES = 300 * 1024;

const extensionFor = (file) => {
  const originalExtension = path.extname(file.originalname || "").toLowerCase();
  if (file.mimetype === "image/png") return originalExtension === ".png" ? ".png" : ".png";
  if (file.mimetype === "image/jpeg") return [".jpg", ".jpeg"].includes(originalExtension) ? originalExtension : ".jpg";
  if (file.mimetype === "image/webp") return ".webp";
  return "";
};

const compressCompletionProofImage = async (file) => {
  if (!sharp) {
    throw new ApiError(500, "Image compression dependency is not installed");
  }

  let width = 1800;
  let quality = 82;
  let buffer = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    buffer = await sharp(file.buffer, { failOn: "none" })
      .rotate()
      .resize({ width, height: 1800, fit: "inside", withoutEnlargement: true })
      .webp({ quality, effort: 5 })
      .toBuffer();

    if (buffer.length <= COMPLETION_PROOF_MAX_BYTES || (quality <= 58 && width <= 1200)) break;
    quality = Math.max(58, quality - 8);
    width = Math.max(1200, width - 180);
  }

  return {
    ...file,
    buffer,
    size: buffer.length,
    mimetype: "image/webp",
    originalname: `${path.basename(file.originalname || "completion-proof", path.extname(file.originalname || ""))}.webp`,
  };
};

const uploadImage = async (file, { folder = "icons", missingMessage = "Please select an icon image to upload", errorLabel = "Icon" } = {}) => {
  if (!file) throw new ApiError(400, missingMessage);

  const cdnBase = String(process.env.NEXT_PUBLIC_ICON_CDN || "").trim().replace(/\/$/, "");
  if (!cdnBase) throw new ApiError(500, `${errorLabel} CDN URL is not configured`);

  const extension = extensionFor(file).replace(".", "");
  const key = `${folder}/${randomUUID()}-${extension}`;

  try {
    await r2Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));
    return { imageUrl: `${cdnBase}/${key}`, icon: `${cdnBase}/${key}` };
  } catch (error) {
    logger.error(`R2 ${errorLabel.toLowerCase()} upload failed`, {
      error: error.message,
      stack: error.stack,
      bucketName,
      contentType: file.mimetype,
      size: file.size,
    });
    throw new ApiError(500, `${errorLabel} upload failed. Please try again.`);
  }
};

const uploadIcon = async (file) => {
  const result = await uploadImage(file, { folder: "icons", errorLabel: "Icon" });
  return { icon: result.icon };
};

const uploadCompletionProof = async (file) => {
  const compressed = await compressCompletionProofImage(file);
  return uploadImage(compressed, {
    folder: "completion-proofs",
    missingMessage: "Please select a completion proof image to upload",
    errorLabel: "Completion proof",
  });
};

module.exports = { uploadIcon, uploadCompletionProof };
