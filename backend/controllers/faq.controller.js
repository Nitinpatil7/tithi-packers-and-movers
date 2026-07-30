
const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const faqService = require("../service/faq.service");

const createFAQ = asyncHandler(async (req, res) => {
  const faq = await faqService.createFAQ(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, faq, "FAQ created successfully"));
});

const getAllFAQs = asyncHandler(async (req, res) => {
  const faqs = await faqService.getAllFAQs(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, faqs, "FAQs fetched successfully"));
});

const getFAQById = asyncHandler(async (req, res) => {
  const faq = await faqService.getFAQById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, faq, "FAQ fetched successfully"));
});

const updateFAQ = asyncHandler(async (req, res) => {
  const faq = await faqService.updateFAQ(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, faq, "FAQ updated successfully"));
});

const deleteFAQ = asyncHandler(async (req, res) => {
  const faq = await faqService.deleteFAQ(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, faq, "FAQ deactivated successfully"));
});

const reorderFAQs = asyncHandler(async (req, res) => {
  const faqs = await faqService.reorderFAQs(req.body.orderedIds);

  return res
    .status(200)
    .json(new ApiResponse(200, faqs, "FAQs reordered successfully"));
});



module.exports = {
    createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
  reorderFAQs,
}
