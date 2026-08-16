const express = require("express");
const mongoose = require("mongoose");
const { getRedisClient, getRedisUrl } = require("../config/redis");

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

router.get("/redis", async (req, res) => {
    const started = performance.now();
    try {
        const redis = await getRedisClient();
        const pong = await Promise.race([
            redis.ping(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Redis ping timed out")), 1500)),
        ]);
        const latencyMs = Math.round(performance.now() - started);
        res.status(pong === "PONG" ? 200 : 503).json({
            success: pong === "PONG",
            message: pong === "PONG" ? "Redis health check passed" : "Redis returned unexpected response",
            redis: {
                status: pong === "PONG" ? "connected" : "unhealthy",
                latencyMs,
                url: getRedisUrl().replace(/\/\/.*@/, "//***@"),
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: error.message,
            redis: {
                status: "disconnected",
                latencyMs: Math.round(performance.now() - started),
                url: getRedisUrl().replace(/\/\/.*@/, "//***@"),
            },
            timestamp: new Date().toISOString(),
        });
    }
})

module.exports = router;
