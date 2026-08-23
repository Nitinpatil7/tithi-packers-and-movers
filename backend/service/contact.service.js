const ContactInquiry = require("../schema/Contact.model");
const ApiError = require("../utility/apierror");
const inAppNotificationService = require("./inAppNotification.service");

const createContactInquiry = async (payload) => {
  const source = payload.source === "item_search" || payload.type === "item_search"
    ? "item_search"
    : "contact_form";
  const searchedTerm = String(payload.searchedTerm || payload.searchQuery || payload.itemQuery || "").trim();
  const inquiry = await ContactInquiry.create({
    ...payload,
    source,
    type: source === "item_search" ? "item_search" : (payload.type || "general"),
    searchedTerm,
    subject: payload.subject || (source === "item_search" ? "Item not found" : undefined),
    message: payload.message || (source === "item_search" && searchedTerm
      ? `Customer searched for "${searchedTerm}" in the booking item catalog, but no matching item was found.`
      : payload.message),
  });
  await inAppNotificationService.createContactQueryNotification(inquiry);
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
