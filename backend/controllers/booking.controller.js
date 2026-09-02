const asyncHandler = require("../middlewere/asyncHandler");
const ApiResponse = require("../utility/apiresponse");
const bookingService = require("../service/booking.service");

const draftToken = (req) => req.get("x-draft-token");

const createDraft = asyncHandler(async (req, res) => {
  const result = await bookingService.createDraft(req.body);
  res.status(201).json(new ApiResponse(201, result, "Booking draft created"));
});
const updateDraft = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateDraft(req.params.bookingId, draftToken(req), req.body);
  res.status(200).json(new ApiResponse(200, booking, "Booking draft updated"));
});
const previewQuote = asyncHandler(async (req, res) => {
  const quote = await bookingService.previewQuote(req.params.bookingId, draftToken(req));
  res.status(200).json(new ApiResponse(200, quote, "Submitted pricing snapshot fetched"));
});
const confirmBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.confirmBooking(req.params.bookingId, draftToken(req), req.body);
  res.status(201).json(new ApiResponse(201, booking, "Booking confirmed successfully"));
});
const trackBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.trackBooking(req.params.bookingId, req.query.mobile);
  res.status(200).json(new ApiResponse(200, booking, "Booking tracking details fetched"));
});
const trackBookingsByMobile = asyncHandler(async (req, res) => {
  const bookings = await bookingService.trackBookingsByMobile(req.query.mobile);
  res.status(200).json(new ApiResponse(200, bookings, "Booking tracking list fetched"));
});
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getAllBookings(req.query);
  res.status(200).json(new ApiResponse(200, bookings, "Bookings fetched"));
});
const getBookingCustomers = asyncHandler(async (req, res) => {
  const customers = await bookingService.getBookingCustomers(req.query);
  res.status(200).json(new ApiResponse(200, customers, "Booking customers fetched"));
});
const getBookingsByPhone = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getBookingsByPhone(req.params.phoneNumber);
  res.status(200).json(new ApiResponse(200, bookings, "Bookings for phone number fetched"));
});
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.bookingId);
  res.status(200).json(new ApiResponse(200, booking, "Booking fetched"));
});
const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingStatus(req.params.bookingId, req.body);
  res.status(200).json(new ApiResponse(200, booking, "Booking status updated"));
});
const updateBookingDetails = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingDetails(req.params.bookingId, req.body);
  res.status(200).json(new ApiResponse(200, booking, "Booking details updated"));
});
const updateCustomerBookingItems = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateCustomerBookingItems(req.params.bookingId, req.body.mobile, req.body);
  res.status(200).json(new ApiResponse(200, booking, "Booking items and add-ons updated"));
});
const completeBookingWithProof = asyncHandler(async (req, res) => {
  const booking = await bookingService.completeBookingWithProof(req.params.bookingId, {
    file: req.file,
    witnessName: req.body?.witnessName,
    adminId: req.admin?._id,
  });
  res.status(200).json(new ApiResponse(200, booking, "Booking completed with proof"));
});
const updateAdminQuote = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateAdminQuote(req.params.bookingId, req.body);
  res.status(200).json(new ApiResponse(200, booking, "Admin pricing snapshot updated"));
});
module.exports = {
  createDraft,
  updateDraft,
  previewQuote,
  confirmBooking,
  trackBooking,
  trackBookingsByMobile,
  getAllBookings,
  getBookingCustomers,
  getBookingsByPhone,
  getBookingById,
  updateBookingStatus,
  updateBookingDetails,
  updateCustomerBookingItems,
  completeBookingWithProof,
  updateAdminQuote,
};
