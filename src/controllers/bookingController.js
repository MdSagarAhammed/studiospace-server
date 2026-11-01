import { Booking } from "../models/Booking.js";
import { Studio } from "../models/Studio.js";
import {
  bookingDateRange,
  bookingIntervalsOverlap,
  parseBookingStart,
} from "../lib/booking-validation.js";

const handle = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const HOUR_IN_MS = 60 * 60 * 1000;

// POST /api/bookings — creates a reservation with status "Pending"
export const createBooking = handle(async (req, res) => {
  const { studioId, date, startTime = "10:00", hours } = req.body || {};

  if (!studioId || !date || hours === undefined) {
    return res.status(400).json({
      success: false,
      message: "studioId, date and hours are required",
    });
  }

  const start = parseBookingStart(date, startTime);
  if (start === null) {
    return res.status(400).json({
      success: false,
      message: "date must be a valid YYYY-MM-DD date and startTime must be HH:mm",
    });
  }

  if (date < new Date().toISOString().slice(0, 10)) {
    return res.status(400).json({
      success: false,
      message: "Bookings cannot be made for a past date",
    });
  }

  const hoursNum = Number(hours);
  if (!Number.isInteger(hoursNum) || hoursNum < 1 || hoursNum > 24) {
    return res.status(400).json({
      success: false,
      message: "hours must be a whole number between 1 and 24",
    });
  }

  const studio = await Studio.findById(studioId);
  if (!studio) {
    return res.status(404).json({ success: false, message: "Studio not found" });
  }

  const end = start + hoursNum * HOUR_IN_MS;
  const { from, through } = bookingDateRange(start, end);
  const existingBookings = await Booking.find({
    studio: studio._id,
    status: { $in: ["Pending", "Confirmed"] },
    date: { $gte: from, $lte: through },
  })
    .select("date startTime hours")
    .lean();

  const hasConflict = existingBookings.some((booking) => {
    const existingStart = parseBookingStart(booking.date, booking.startTime);
    return (
      existingStart !== null &&
      bookingIntervalsOverlap(
        start,
        end,
        existingStart,
        Number(booking.hours)
      )
    );
  });
  if (hasConflict) {
    return res.status(409).json({
      success: false,
      message: "This studio is already booked for part of that time",
    });
  }

  // Server-side pricing from the studio's current rate
  const rate = Number(studio.hourlyRate);

  const booking = await Booking.create({
    studio: studio._id,
    user: req.user.id,
    bookerName: req.user.name,
    bookerEmail: req.user.email,
    date,
    startTime,
    hours: hoursNum,
    hourlyRate: rate,
    totalPrice: rate * hoursNum,
    status: "Pending",
  });

  res.status(201).json({ success: true, data: booking });
});

// GET /api/bookings/mine — session user's reservations with studio summary
export const getMyBookings = handle(async (req, res) => {
  const data = await Booking.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate("studio", "title images location hourlyRate")
    .lean();
  res.json({ success: true, data });
});

// PATCH /api/bookings/:id/cancel — only pending, only your own
export const cancelBooking = handle(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  if (String(booking.user) !== String(req.user.id)) {
    return res.status(403).json({ success: false, message: "You can only cancel your own bookings" });
  }
  if (booking.status !== "Pending") {
    return res.status(400).json({
      success: false,
      message: `Only Pending bookings can be cancelled (current status: ${booking.status})`,
    });
  }
  booking.status = "Cancelled";
  await booking.save();
  res.json({ success: true, data: booking });
});
