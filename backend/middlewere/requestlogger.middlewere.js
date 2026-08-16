const logger = require("../utility/logger");

const requestlogger = (req,res, next)=>{
    const starttime = Date.now();

    res.on("finish", ()=>{
        const duration = Date.now() - starttime;

        const log = {
            requestId: req.requestId,
            method : req.method,
            url: req.originalUrl,
            statusCode : res.statusCode,
            duration,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        };
        if(duration > 1000){
            logger.warn("Slow API request", log);
        }else{
            logger.info("API request", log);
        }
    });

    next();
}

module.exports = requestlogger;
