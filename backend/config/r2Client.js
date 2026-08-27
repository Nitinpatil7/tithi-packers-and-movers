const { S3Client } = require("@aws-sdk/client-s3");

const REQUIRED_ENV = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
];

const missing = REQUIRED_ENV.filter((key) => !String(process.env[key] || "").trim());
if (missing.length) {
  throw new Error(`Missing required R2 environment variable(s): ${missing.join(", ")}`);
}

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

module.exports = {
  r2Client,
  bucketName: process.env.R2_BUCKET_NAME,
};
