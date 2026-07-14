const asynchandler = require("../middlewere/asyncHandler");
const sitesettingservice = require("../service/Sitesetting.service");
const apiresponse = require("../utility/apiresponse");


const getsetting = asynchandler(async(req,res)=>{
    const setting = await sitesettingservice.getsitesetting();

    return res.status(200).json( new apiresponse(200, setting , "Site setting Fetched Successfully"));
})

const updatesetting = asynchandler(async(req,res)=>{
    const setting = await sitesettingservice.updatesitesetting(req.body);

    return res.status(200).json( new apiresponse(200, setting , "site setting update successfully"))
})

module.exports = { getsetting , updatesetting};
