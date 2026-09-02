const FAQ = require("../schema/Faq.model");
const ApiError = require("../utility/apierror");
const { notifyContentChange } = require("../utility/contentEvents");

const createFAQ = async (payload) => {
  const last = await FAQ.findOne({}).sort({ sortOrder: -1, createdAt: -1 }).select("sortOrder");
  const faq = await FAQ.create({ ...payload, sortOrder: payload.sortOrder ?? Number(last?.sortOrder ?? -1) + 1 });
  notifyContentChange("faq", "faq:create", { id: faq._id });
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
    createdAt: 1,
  });

  return faqs;
};

const getFAQById = async (faqId) => {
  const faq = await FAQ.findById(faqId);

  if (!faq) {
    throw new ApiError(404, "FAQ not found");
  }

  notifyContentChange("faq", "faq:update", { id: faqId });
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

  notifyContentChange("faq", "faq:delete", { id: faqId });
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

const reorderFAQs = async (orderedIds = []) => {
  const ids = [...new Set((orderedIds || []).map(String))];
  if (!ids.length) throw new ApiError(400, "Ordered FAQ IDs are required");
  const count = await FAQ.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) throw new ApiError(400, "One or more FAQs are invalid");
  await FAQ.bulkWrite(ids.map((id, index) => ({
    updateOne: { filter: { _id: id }, update: { $set: { sortOrder: index } } },
  })));
  notifyContentChange("faq", "faq:reorder");
  return FAQ.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
};


module.exports = {
    createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
  reorderFAQs,
}
