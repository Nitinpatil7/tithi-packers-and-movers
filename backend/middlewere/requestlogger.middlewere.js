const requestlogger = (req,res, next)=>{
    const starttime = Date.now();

    res.on("finish", ()=>{
        const duration = Date.now() - starttime;

        const log = {
            //requestid = req.requestId,
            method : req.method,
            url: req.originalUrl,
            statusCode : res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get("user-agent"),
            timestamp : new Date().toISOString(),
        };
        if(duration > 1000){
            console.warn("Slow API:", log);
        }else{
            console.log("API Log:",log);
        }
    });

    next();
}

module.exports = requestlogger;