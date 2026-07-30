const errorMiddleware = (err , req , res , next) =>{
    const statuscode = err.statuscode || err.status || 500;
    const message =
        err.type === "entity.too.large"
            ? "Request payload is too large. Please reduce selected items or contact support."
            : err.message || " Internal Server Error";
    
    const errorLog = {
        message,
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
        message,
        error: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    })
}

module.exports = errorMiddleware;
