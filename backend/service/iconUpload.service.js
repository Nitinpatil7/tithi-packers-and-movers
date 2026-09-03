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
const FEEDBACK_IMAGE_MAX_BYTES = 950 * 1024;

const extensionFor = (file) => {
  const originalExtension = path.extname(file.originalname || "").toLowerCase();
  if (file.mimetype === "image/png") return originalExtension === ".png" ? ".png" : ".png";
  if (file.mimetype === "image/jpeg") return [".jpg", ".jpeg"].includes(originalExtension) ? originalExtension : ".jpg";
  if (file.mimetype === "image/webp") return ".webp";
  return "";
};

const compressImageToWebp = async (file, {
  maxBytes,
  startWidth = 1800,
  minWidth = 900,
  startQuality = 82,
  minQuality = 56,
  baseName = "image",
} = {}) => {
  if (!sharp) {
    throw new ApiError(500, "Image compression dependency is not installed");
  }

  let width = startWidth;
  let quality = startQuality;
  let buffer = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    buffer = await sharp(file.buffer, { failOn: "none" })
      .rotate()
      .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
      .webp({ quality, effort: 5 })
      .toBuffer();

    if (buffer.length <= maxBytes || (quality <= minQuality && width <= minWidth)) break;
    if (quality > minQuality) quality = Math.max(minQuality, quality - 8);
    else width = Math.max(minWidth, width - 180);
  }

  if (!buffer || buffer.length > maxBytes) {
    throw new ApiError(400, `${baseName} could not be compressed under ${Math.round(maxBytes / 1024)} KB. Please choose a smaller image.`);
  }

  return {
    ...file,
    buffer,
    size: buffer.length,
    mimetype: "image/webp",
    originalname: `${path.basename(file.originalname || baseName, path.extname(file.originalname || ""))}.webp`,
  };
};

const compressCompletionProofImage = async (file) => compressImageToWebp(file, {
  maxBytes: COMPLETION_PROOF_MAX_BYTES,
  startWidth: 1800,
  minWidth: 1200,
  startQuality: 82,
  minQuality: 58,
  baseName: "completion-proof",
});

const fileFromDataUrl = (dataUrl, baseName = "feedback") => {
  const match = String(dataUrl || "").match(/^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) throw new ApiError(400, "Image must be a valid image upload");
  const subtype = match[1].toLowerCase().replace("jpg", "jpeg");
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length) throw new ApiError(400, "Image upload is empty");
  return {
    buffer,
    size: buffer.length,
    mimetype: `image/${subtype}`,
    originalname: `${baseName}.${subtype === "jpeg" ? "jpg" : subtype}`,
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

const uploadFeedbackImage = async (dataUrl) => {
  const file = fileFromDataUrl(dataUrl, "feedback");
  const compressed = await compressImageToWebp(file, {
    maxBytes: FEEDBACK_IMAGE_MAX_BYTES,
    startWidth: 1400,
    minWidth: 720,
    startQuality: 82,
    minQuality: 56,
    baseName: "feedback",
  });
  return uploadImage(compressed, {
    folder: "feedback",
    missingMessage: "Please select a feedback image to upload",
    errorLabel: "Feedback image",
  });
};

module.exports = { uploadIcon, uploadCompletionProof, uploadFeedbackImage, compressImageToWebp };
