const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");

const errormiddlewere = require("./middlewere/error.middlewere");
const requestlogger = require("../backend/middlewere/requestlogger.middlewere");
const healthroute = require("../backend/routes/health.routes");
const notfoundmiddlewere = require("./middlewere/notfound.middlewere");
const requestidmiddlewere = require("./middlewere/requestid.middlewere");

const sitesettingroutes = require("./routes/sitesetting.routes") 
const branchroutes = require("./routes/branch.routes");
const contactroutes = require("./routes/contact.routes");
const faqroutes = require("./routes/faq.routes");
const testimonialroutes = require("./routes/testimonial.routes");
const legelroutes = require("./routes/legal.routes");
const notificationroutes = require("./routes/notification.routes");
const addonroutes = require("./routes/addon.routes");
const inAppNotificationRoutes = require("./routes/inAppNotification.routes");
const otpRoutes = require("./routes/otp.routes");
const itemRoutes = require("./routes/item.routes");
const adminIconRoutes = require("./routes/adminIcon.routes");
const bookingRoutes = require("./routes/booking.routes");
const bookingPricingRuleRoutes = require("./routes/bookingPricingRule.routes");
const adminAuthRoutes = require("./routes/adminAuth.routes");
const adminAnalyticsRoutes = require("./routes/adminAnalytics.routes");

const app = express();
app.set("trust proxy", 1);
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || "2mb";

const defaultAllowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
];

const allowedOrigins = [
    process.env.CLIENT_URL,
    ...(process.env.CLIENT_URLS || "").split(","),
    ...defaultAllowedOrigins,
]
    .filter(Boolean)
    .map((origin) => origin.trim().replace(/\/$/, ""));

app.set("allowedOrigins", allowedOrigins);

app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/$/, "");
        if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
        return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
}))

app.use(helmet());
app.use(express.json({ limit: requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: requestBodyLimit }));
app.use(cookieParser());
app.use(requestidmiddlewere);
app.use(requestlogger);
app.use(
    "/logo",
    express.static(path.join(__dirname, "public", "logo"), {
        immutable: true,
        maxAge: "365d",
        setHeaders(res) {
            res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        },
    }),
);

if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"));
}
app.get("/",(req,res)=>{
    res.status(200)
.json({
    success:true,
    message:"Welcome to Tithi Packers and Movers API is Running",
})

});

//all routes
app.use("/api/site-setting", sitesettingroutes);
app.use("/api/branch", branchroutes);
app.use("/api/contact", contactroutes);
app.use("/api/faq" , faqroutes);
app.use("/api/testimonial" , testimonialroutes);
app.use("/api/legal" , legelroutes);
app.use("/api/notification", notificationroutes);
app.use("/api/addon" , addonroutes);
app.use("/api/in-app-notifications", inAppNotificationRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/admin/icons", adminIconRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/booking-pricing-rules", bookingPricingRuleRoutes);
app.use("/api/admin-auth", adminAuthRoutes);
app.use("/api/admin-analytics", adminAnalyticsRoutes);

app.use("/api/v1/health", healthroute);
app.use(notfoundmiddlewere)
app.use(errormiddlewere);

module.exports = app;
