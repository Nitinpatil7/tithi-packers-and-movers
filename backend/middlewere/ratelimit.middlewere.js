const ratelimit = require("express-rate-limit");

const otpSendRateLimiter = ratelimit({
    windowMs : 15 * 60 * 1000, // 15 minutes
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message:{
        success: false,
        message:"Too many Otp requests, Please try again later",
    } 
})


const otpVerifyRateLimiter = ratelimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP verification attempts, please try again later",
    },
})

const bookingRateLimiter = ratelimit({
    windowMs : 15 * 60 * 1000, // 15 minutes
    limit: 20,
    message:{
        success: false,
        message:"Too many booking requests, Please try again later",
    }
})

const adminLoginRateLimiter = ratelimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many admin login attempts, please try again later",
    },
})

module.exports = {
    otpSendRateLimiter,
    otpVerifyRateLimiter,
    bookingRateLimiter,
    adminLoginRateLimiter,
};
