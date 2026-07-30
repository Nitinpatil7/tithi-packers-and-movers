
const Testimonial = require("../schema/Testimonial.model")
const ApiError = require("../utility/apierror");
const { notifyContentChange } = require("../utility/contentEvents");

const createTestimonial = async (payload) => {
  const testimonial = await Testimonial.create(payload);
  notifyContentChange("testimonial", "testimonial:create", { id: testimonial._id });
  return testimonial;
};

const getPublicTestimonials = async (query = {}) => {
  const filter = {
    status: "active",
  };

  if (query.featured === "true") {
    filter.isFeatured = true;
  }

  if (query.serviceType) {
    filter.serviceType = query.serviceType;
  }

  const testimonials = await Testimonial.find(filter).sort({
    sortOrder: 1,
    createdAt: -1,
  });

  return testimonials;
};

const getAllTestimonialsForAdmin = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.serviceType) {
    filter.serviceType = query.serviceType;
  }

  if (query.featured === "true") {
    filter.isFeatured = true;
  }

  if (query.featured === "false") {
    filter.isFeatured = false;
  }

  const testimonials = await Testimonial.find(filter).sort({
    sortOrder: 1,
    createdAt: -1,
  });

  return testimonials;
};

const getTestimonialById = async (testimonialId) => {
  const testimonial = await Testimonial.findById(testimonialId);

  if (!testimonial) {
    throw new ApiError(404, "Testimonial not found");
  }

  notifyContentChange("testimonial", "testimonial:update", { id: testimonialId });
  return testimonial;
};

const updateTestimonial = async (testimonialId, payload) => {
  const testimonial = await Testimonial.findByIdAndUpdate(
    testimonialId,
    { $set: payload },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!testimonial) {
    throw new ApiError(404, "Testimonial not found");
  }

  notifyContentChange("testimonial", "testimonial:delete", { id: testimonialId });
  return testimonial;
};

const reorderTestimonials = async (orderedIds = []) => {
  const ids = [...new Set((orderedIds || []).map(String))];
  if (!ids.length) throw new ApiError(400, "Ordered testimonial IDs are required");
  const count = await Testimonial.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) throw new ApiError(400, "One or more testimonials are invalid");
  await Testimonial.bulkWrite(ids.map((id, index) => ({
    updateOne: { filter: { _id: id }, update: { $set: { sortOrder: index } } },
  })));
  notifyContentChange("testimonial", "testimonial:reorder");
  return getAllTestimonialsForAdmin({});
};

const deleteTestimonial = async (testimonialId) => {
  const testimonial = await Testimonial.findByIdAndUpdate(
    testimonialId,
    { $set: { status: "inactive" } },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!testimonial) {
    throw new ApiError(404, "Testimonial not found");
  }

  return testimonial;
};



module.exports = {
    createTestimonial,
  getPublicTestimonials,
  getAllTestimonialsForAdmin,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,

}
