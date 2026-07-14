const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { bootstrapDefaultAdmin } = require("./service/adminAuth.service");
const attachMonitoringSocket = require("./utility/monitoringSocket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    await bootstrapDefaultAdmin();

    const server = http.createServer(app);
    attachMonitoringSocket(server, app, PORT);

    server.listen(PORT , ()=>{
        console.log(`server is running on port ${PORT}`);
    })
}

startServer();
