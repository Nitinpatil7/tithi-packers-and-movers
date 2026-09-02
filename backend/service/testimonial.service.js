
const Testimonial = require("../schema/Testimonial.model")
const Booking = require("../schema/Booking.model");
const ApiError = require("../utility/apierror");
const { notifyContentChange } = require("../utility/contentEvents");
const inAppNotificationService = require("./inAppNotification.service");

const createTestimonial = async (payload) => {
  const last = await Testimonial.findOne({}).sort({ sortOrder: -1, createdAt: -1 }).select("sortOrder");
  const testimonial = await Testimonial.create({ ...payload, sortOrder: payload.sortOrder ?? Number(last?.sortOrder ?? -1) + 1 });
  notifyContentChange("testimonial", "testimonial:create", { id: testimonial._id });
  return testimonial;
};

const submitPublicFeedback = async (payload = {}) => {
  const name = String(payload.name || "").trim();
  const location = String(payload.location || "").trim();
  const content = String(payload.content || payload.words || "").trim();
  const rating = Number(payload.rating || payload.stars);
  const imageUrl = String(payload.imageUrl || "").trim();

  if (!name) throw new ApiError(400, "Name is required");
  if (!location) throw new ApiError(400, "Location is required");
  if (!content) throw new ApiError(400, "Testimonial text is required");
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 and 5");
  if (imageUrl && !/^data:image\/(png|jpeg|jpg|webp);base64,|^https?:\/\//i.test(imageUrl)) {
    throw new ApiError(400, "Image must be a valid image upload or URL");
  }

  const testimonial = await createTestimonial({
    name,
    location,
    rating,
    content,
    ...(imageUrl ? { imageUrl } : {}),
    serviceType: payload.serviceType || "local_shifting",
    isFeatured: false,
    status: "inactive",
    submittedAt: new Date(),
  });
  await inAppNotificationService.createFeedbackNotification(testimonial);
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
    createdAt: 1,
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
  const search = String(query.search || "").trim();
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { location: { $regex: escaped, $options: "i" } },
      { bookingNumber: { $regex: escaped, $options: "i" } },
    ];
  }

  const testimonials = await Testimonial.find(filter).sort({
    sortOrder: 1,
    createdAt: 1,
  });

  return testimonials;
};

const getFeedbackContext = async (token) => {
  const booking = await Booking.findOne({ "feedback.token": token, status: "completed" })
    .select("bookingid customer serviceType pickuplocation feedback status")
    .lean();
  if (!booking) throw new ApiError(404, "Feedback link is invalid or expired");
  if (booking.feedback?.submittedAt) throw new ApiError(409, "Feedback has already been submitted for this booking");
  return {
    bookingId: booking.bookingid,
    customerName: booking.customer?.name || "",
    location: booking.pickuplocation?.city || booking.pickuplocation?.address || "",
    serviceType: booking.serviceType,
  };
};

const submitFeedback = async (token, payload = {}) => {
  const booking = await Booking.findOne({ "feedback.token": token, status: "completed" });
  if (!booking) throw new ApiError(404, "Feedback link is invalid or expired");
  if (booking.feedback?.submittedAt) throw new ApiError(409, "Feedback has already been submitted for this booking");

  const name = String(payload.name || "").trim();
  const location = String(payload.location || "").trim();
  const content = String(payload.content || payload.words || "").trim();
  const rating = Number(payload.rating || payload.stars);
  const imageUrl = String(payload.imageUrl || "").trim();

  if (!name) throw new ApiError(400, "Name is required");
  if (!location) throw new ApiError(400, "Location is required");
  if (!content) throw new ApiError(400, "Testimonial text is required");
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 and 5");
  if (imageUrl && !/^data:image\/(png|jpeg|jpg|webp);base64,|^https?:\/\//i.test(imageUrl)) {
    throw new ApiError(400, "Image must be a valid image upload or URL");
  }

  const testimonial = await createTestimonial({
    name,
    location,
    rating,
    content,
    ...(imageUrl ? { imageUrl } : {}),
    serviceType: booking.serviceType === "porter_labour_service" ? "ordinary_services" : booking.serviceType,
    isFeatured: false,
    status: "inactive",
    linkedBookingId: booking._id,
    bookingNumber: booking.bookingid,
    submittedAt: new Date(),
  });

  booking.feedback = {
    ...(booking.feedback || {}),
    submittedAt: new Date(),
    testimonialId: testimonial._id,
  };
  await booking.save();
  await inAppNotificationService.createFeedbackNotification(testimonial, booking);
  return testimonial;
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
  submitPublicFeedback,
  getPublicTestimonials,
  getAllTestimonialsForAdmin,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  getFeedbackContext,
  submitFeedback,

}
