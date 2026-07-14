const errorMiddleware = (err , req , res , next) =>{
    const statuscode = err.statuscode || 500;
    
    const errorLog = {
        message: err.message,
        statusCode: statuscode,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        body: req.body,
        params: req.params,
        query: req.query,
        stack: err.stack,
        timestamp: new Date().toISOString(),
    };

    console.error("API Error: ", errorLog);

    return res.status(statuscode).json({
        success:false,
        statuscode,
        message: err.message || " Internal Server Error",
        error: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    })
}

module.exports = errorMiddleware;
