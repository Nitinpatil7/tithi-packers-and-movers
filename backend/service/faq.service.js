const FAQ = require("../schema/Faq.model");
const ApiError = require("../utility/apierror");

const createFAQ = async (payload) => {
  const faq = await FAQ.create(payload);
  return faq;
};

const getAllFAQs = async (query = {}) => {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  // Public side normally sirf active FAQs dekhega
  filter.isActive = true;

  const faqs = await FAQ.find(filter).sort({
    sortOrder: 1,
    createdAt: -1,
  });

  return faqs;
};

const getFAQById = async (faqId) => {
  const faq = await FAQ.findById(faqId);

  if (!faq) {
    throw new ApiError(404, "FAQ not found");
  }

  return faq;
};

const updateFAQ = async (faqId, payload) => {
  const faq = await FAQ.findByIdAndUpdate(
    faqId,
    { $set: payload },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!faq) {
    throw new ApiError(404, "FAQ not found");
  }

  return faq;
};

const deleteFAQ = async (faqId) => {
  const faq = await FAQ.findByIdAndUpdate(
    faqId,
    { $set: { isActive: false } },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!faq) {
    throw new ApiError(404, "FAQ not found");
  }

  return faq;
};


module.exports = {
    createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
}