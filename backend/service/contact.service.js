const ContactInquiry = require("../schema/Contact.model");
const ApiError = require("../utility/apierror");

const createContactInquiry = async (payload) => {
  const inquiry = await ContactInquiry.create(payload);
  return inquiry;
};

const getAllContactInquiries = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  const inquiries = await ContactInquiry.find(filter).sort({
    createdAt: -1,
  });

  return inquiries;
};

const getContactInquiryById = async (inquiryId) => {
  const inquiry = await ContactInquiry.findById(inquiryId);

  if (!inquiry) {
    throw new ApiError(404, "Contact inquiry not found");
  }

  return inquiry;
};

const updateContactInquiry = async (inquiryId, payload) => {
  const inquiry = await ContactInquiry.findByIdAndUpdate(
    inquiryId,
    {
      $set: payload,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!inquiry) {
    throw new ApiError(404, "Contact inquiry not found");
  }

  return inquiry;
};

const deleteContactInquiry = async (inquiryId) => {
  const inquiry = await ContactInquiry.findByIdAndDelete(inquiryId);

  if (!inquiry) {
    throw new ApiError(404, "Contact inquiry not found");
  }

  return inquiry;
};


module.exports = {
  createContactInquiry,
  getAllContactInquiries,
  getContactInquiryById,
  updateContactInquiry,
  deleteContactInquiry,
   
}