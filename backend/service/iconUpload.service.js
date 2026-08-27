const path = require("path");
const { randomUUID } = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const ApiError = require("../utility/apierror");
const logger = require("../utility/logger");
const { r2Client, bucketName } = require("../config/r2Client");

const extensionFor = (file) => {
  const originalExtension = path.extname(file.originalname || "").toLowerCase();
  if (file.mimetype === "image/png") return originalExtension === ".png" ? ".png" : ".png";
  if (file.mimetype === "image/jpeg") return [".jpg", ".jpeg"].includes(originalExtension) ? originalExtension : ".jpg";
  return "";
};

const uploadIcon = async (file) => {
  if (!file) throw new ApiError(400, "Please select an icon image to upload");

  const cdnBase = String(process.env.NEXT_PUBLIC_ICON_CDN || "").trim().replace(/\/$/, "");
  if (!cdnBase) throw new ApiError(500, "Icon CDN URL is not configured");

  const extension = extensionFor(file).replace(".", "");
  const key = `icons/${randomUUID()}-${extension}`;

  try {
    await r2Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));
    return { icon: `${cdnBase}/${key}` };
  } catch (error) {
    logger.error("R2 icon upload failed", {
      error: error.message,
      stack: error.stack,
      bucketName,
      contentType: file.mimetype,
      size: file.size,
    });
    throw new ApiError(500, "Icon upload failed. Please try again.");
  }
};

module.exports = { uploadIcon };
