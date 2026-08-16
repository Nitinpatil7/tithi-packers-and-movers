const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("../schema/Admin.model");

async function main() {
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  if (!email || !password) throw new Error("DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD are required");
  if (password.length < 12) throw new Error("DEFAULT_ADMIN_PASSWORD must be at least 12 characters");

  await mongoose.connect(process.env.MONGO_URI);
  const admin = await Admin.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    {
      $set: {
        passwordHash: await bcrypt.hash(password, 12),
        mustChangePassword: false,
        passwordChangedAt: new Date(),
        isActive: true,
      },
    },
    { new: true },
  ).lean();

  if (!admin) throw new Error(`Admin not found for ${email}`);
  console.log(JSON.stringify({
    ok: true,
    email: admin.email,
    role: admin.role,
    mustChangePassword: admin.mustChangePassword,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
