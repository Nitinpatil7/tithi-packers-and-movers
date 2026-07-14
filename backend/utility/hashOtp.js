const bcrypt = require("bcrypt");

const hashOtp = (otp) => bcrypt.hash(otp, 10);

const compareOtp = (otp, hashedOtp) => bcrypt.compare(otp, hashedOtp);

module.exports = { hashOtp, compareOtp };
