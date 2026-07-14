const asynchandler = require("../middlewere/asyncHandler")
const ApiResponse = require("../utility/apiresponse")
const branch = require("../service/branch.service");

const createbranch = asynchandler(async(req,res)=>{
    const newbranch = await branch.createbranch(req.body);

    return res.status(201).json(new ApiResponse(201 , newbranch , "Branch Created Successfully"));
})

const getallbranches = asynchandler(async(req,res)=>{
    const newbranches = await branch.getallbranch();

    return res.status(200).json(new ApiResponse(200, newbranches , "Branches fetched successfully" ))
})

const getbranchbyid = asynchandler(async (req, res) => {
  const newbranch = await branch.getbranchbyid(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, newbranch, "Branch fetched successfully"));
});

const getmainbranch = asynchandler(async (req, res) => {
  const newbranch = await branch.getmainbranch();

  return res
    .status(200)
    .json(new ApiResponse(200, newbranch, "Main branch fetched successfully"));
});

const updatebranch = asynchandler(async (req, res) => {
  const newbranch = await branch.updatebranch(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, newbranch, "Branch updated successfully"));
});

const deletebranch = asynchandler(async (req, res) => {
  const newbranch = await branch.deletebranch(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, newbranch, "Branch deactivated successfully"));
});

module.exports = {
  createbranch,
  getallbranches,
  getbranchbyid,
  getmainbranch,
  updatebranch,
  deletebranch,
};
