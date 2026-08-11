const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { bootstrapDefaultAdmin } = require("./service/adminAuth.service");
const attachMonitoringSocket = require("./utility/monitoringSocket");
const { startNotificationWorker } = require("./queue/notification.queue");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    await bootstrapDefaultAdmin();

    const server = http.createServer(app);
    attachMonitoringSocket(server, app, PORT);
    startNotificationWorker();

    server.listen(PORT , ()=>{
        console.log(`server is running on port ${PORT}`);
    })
}

startServer();
