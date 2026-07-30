
const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const testimonialService = require("../service/testimonial.service");

const createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await testimonialService.createTestimonial(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, testimonial, "Testimonial created successfully"));
});

const getPublicTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.getPublicTestimonials(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, testimonials, "Testimonials fetched successfully"));
});

const getAllTestimonialsForAdmin = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.getAllTestimonialsForAdmin(
    req.query
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, testimonials, "Admin testimonials fetched successfully")
    );
});

const getTestimonialById = asyncHandler(async (req, res) => {
  const testimonial = await testimonialService.getTestimonialById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, testimonial, "Testimonial fetched successfully"));
});

const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await testimonialService.updateTestimonial(
    req.params.id,
    req.body
  );

  return res
    .status(200)
    .json(new ApiResponse(200, testimonial, "Testimonial updated successfully"));
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await testimonialService.deleteTestimonial(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, testimonial, "Testimonial deactivated successfully"));
});

const reorderTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.reorderTestimonials(req.body.orderedIds);

  return res
    .status(200)
    .json(new ApiResponse(200, testimonials, "Testimonials reordered successfully"));
});

module.exports = {
 createTestimonial,
  getPublicTestimonials,
  getAllTestimonialsForAdmin,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
}
