const asyncHandler = require("../middlewere/asyncHandler" )
const ApiResponse = require("../utility/apiresponse");
const legalService = require("../service/legal.service");

const createLegalPage = asyncHandler(async (req, res) => {
  const page = await legalService.createLegalPage(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, page, "Legal page created successfully"));
});

const getPublicLegalPageBySlug = asyncHandler(async (req, res) => {
  const page = await legalService.getPublicLegalPageBySlug(req.params.slug);

  return res
    .status(200)
    .json(new ApiResponse(200, page, "Legal page fetched successfully"));
});

const getAllLegalPagesForAdmin = asyncHandler(async (req, res) => {
  const pages = await legalService.getAllLegalPagesForAdmin(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, pages, "Legal pages fetched successfully"));
});

const getLegalPageById = asyncHandler(async (req, res) => {
  const page = await legalService.getLegalPageById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, page, "Legal page fetched successfully"));
});

const updateLegalPage = asyncHandler(async (req, res) => {
  const page = await legalService.updateLegalPage(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, page, "Legal page updated successfully"));
});

const deleteLegalPage = asyncHandler(async (req, res) => {
  const page = await legalService.deleteLegalPage(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, page, "Legal page unpublished successfully"));
});

module.exports = {
  createLegalPage,
  getPublicLegalPageBySlug,
  getAllLegalPagesForAdmin,
  getLegalPageById,
  updateLegalPage,
  deleteLegalPage,
};
