
const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const contactService = require("../service/contact.service");

const createContactInquiry = asyncHandler(async (req, res) => {
  const inquiry = await contactService.createContactInquiry(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, inquiry, "Contact inquiry submitted successfully"));
});

const getAllContactInquiries = asyncHandler(async (req, res) => {
  const inquiries = await contactService.getAllContactInquiries(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, inquiries, "Contact inquiries fetched successfully"));
});

const getContactInquiryById = asyncHandler(async (req, res) => {
  const inquiry = await contactService.getContactInquiryById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, inquiry, "Contact inquiry fetched successfully"));
});

const updateContactInquiry = asyncHandler(async (req, res) => {
  const inquiry = await contactService.updateContactInquiry(
    req.params.id,
    req.body
  );

  return res
    .status(200)
    .json(new ApiResponse(200, inquiry, "Contact inquiry updated successfully"));
});

const deleteContactInquiry = asyncHandler(async (req, res) => {
  const inquiry = await contactService.deleteContactInquiry(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, inquiry, "Contact inquiry deleted successfully"));
});



module.exports = {
     createContactInquiry,
  getAllContactInquiries,
  getContactInquiryById,
  updateContactInquiry,
  deleteContactInquiry,
}