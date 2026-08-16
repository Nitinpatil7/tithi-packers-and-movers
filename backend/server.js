const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { bootstrapDefaultAdmin } = require("./service/adminAuth.service");
const attachMonitoringSocket = require("./utility/monitoringSocket");
const { startNotificationWorker } = require("./queue/notification.queue");
const logger = require("./utility/logger");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    await bootstrapDefaultAdmin();

    const server = http.createServer(app);
    attachMonitoringSocket(server, app, PORT);
    startNotificationWorker();

    server.listen(PORT , ()=>{
        logger.info("Server listening", { port: PORT, environment: process.env.NODE_ENV || "development" });
    })
}

startServer().catch((error) => {
    logger.error("Server failed to start", { error: error.message, stack: error.stack });
    process.exit(1);
});
