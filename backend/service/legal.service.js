const LegalPage  = require("../schema/Legal.schema");
const ApiError = require("../utility/apierror");


const createLegalPage = async (payload) => {
  const page = await LegalPage.create(payload);
  return page;
};

const getPublicLegalPageBySlug = async (slug) => {
  const page = await LegalPage.findOne({
    slug,
    isPublished: true,
  });

  if (!page) {
    throw new ApiError(404, "Legal page not found");
  }

  return page;
};

const getAllLegalPagesForAdmin = async (query = {}) => {
  const filter = {};

  if (query.isPublished === "true") {
    filter.isPublished = true;
  }

  if (query.isPublished === "false") {
    filter.isPublished = false;
  }

  if (query.type) {
    filter.type = query.type;
  }

  const pages = await LegalPage.find(filter).sort({
    createdAt: -1,
  });

  return pages;
};

const getLegalPageById = async (pageId) => {
  const page = await LegalPage.findById(pageId);

  if (!page) {
    throw new ApiError(404, "Legal page not found");
  }

  return page;
};

const updateLegalPage = async (pageId, payload) => {
  const page = await LegalPage.findByIdAndUpdate(
    pageId,
    { $set: payload },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!page) {
    throw new ApiError(404, "Legal page not found");
  }

  return page;
};

const deleteLegalPage = async (pageId) => {
  const page = await LegalPage.findByIdAndUpdate(
    pageId,
    { $set: { isPublished: false } },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!page) {
    throw new ApiError(404, "Legal page not found");
  }

  return page;
};
module.exports = {
  createLegalPage,
  getPublicLegalPageBySlug,
  getAllLegalPagesForAdmin,
  getLegalPageById,
  updateLegalPage,
  deleteLegalPage,
};