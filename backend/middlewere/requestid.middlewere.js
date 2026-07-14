const crypto = require("crypto");

const requestidmiddlewere = (req,res,next)=>{
    req.requestId = crypto.randomUUID();
    res.setHeader("X-Request-Id", req.requestId);
    next();
}

module.exports = requestidmiddlewere;