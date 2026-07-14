const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", (req,res)=>{
    const dbstatus = mongoose.connection.readyState === 1?"connected" : "disconnected";

    res.status(200).json({
        success:true,
        message: "Thithi Packers Api Health check",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: dbstatus,
        memory: {
            rss:process.memoryUsage().rss,
            heapused: process.memoryUsage().heapUsed,
            heaptotal: process.memoryUsage().heapTotal,
        }
    })
})

module.exports = router;
