const apierror = require("../utility/apierror");

const notfoundmiddlewere = (req,res,next)=>{
    next(new apierror(404 , `Route Not Found: ${req.originalUrl}`));
}

module.exports = notfoundmiddlewere;