import { ObjectId } from "mongodb";
import { bookings, BOOKING_SLOT_FIELDS } from "../models/Booking.js";
import { studios, castObjectId } from "../models/Studio.js";import {
  bookingDateRange,
  bookingIntervalsOverlap,
  parseBookingStart,
} from "../lib/booking-validation.js";

const handle = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const HOUR_IN_MS = 60 * 60 * 1000;
const now = () => new Date();

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

  const _id = castObjectId(studioId);
  const studio = _id ? await studios().findOne({ _id }) : null;
  if (!studio) {
    return res.status(404).json({ success: false, message: "Studio not found" });
  }

  const end = start + hoursNum * HOUR_IN_MS;
  const { from, through } = bookingDateRange(start, end);
  const existingBookings = await bookings()
    .find(
      {
        studio: studio._id,
        status: { $in: ["Pending", "Confirmed"] },
        date: { $gte: from, $lte: through },
      },
      { projection: BOOKING_SLOT_FIELDS }
    )
    .toArray();

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

  const rate = Number(studio.hourlyRate);

  const user = castObjectId(req.user.id);
  if (!user) {
    return res.status(400).json({ success: false, message: "Malformed session user id" });
  }

  const doc = {
    studio: studio._id,
    user,
    bookerName: req.user.name,
    bookerEmail: (req.user.email || "").toLowerCase(),
    date,
    startTime,
    hours: hoursNum,
    hourlyRate: rate,
    totalPrice: rate * hoursNum,
    status: "Pending",
    createdAt: now(),
    updatedAt: now(),
  };
  const inserted = await bookings().insertOne(doc);
  const booking = { ...doc, _id: inserted.insertedId };

  res.status(201).json({ success: true, data: booking });
});

export const getMyBookings = handle(async (req, res) => {
  const user = castObjectId(req.user.id);
  const rows = await bookings()
    .find({ user }, { sort: { createdAt: -1 } })
    .toArray();
  if (rows.length === 0) {
    return res.json({ success: true, data: [] });
  }

  const studioIds = [...new Set(rows.map((row) => new ObjectId(row.studio)))];
  const summaries = await studios()
    .find({ _id: { $in: studioIds } }, { projection: { title: 1, images: 1, location: 1, hourlyRate: 1 } })
    .toArray();
  const byId = new Map(summaries.map((studio) => [String(studio._id), studio]));
  const data = rows.map((row) => ({ ...row, studio: byId.get(String(row.studio)) ?? row.studio }));

  res.json({ success: true, data });
});

export const cancelBooking = handle(async (req, res) => {
  const _id = castObjectId(req.params.id);
  const booking = _id ? await bookings().findOne({ _id }) : null;
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
  const updated = await bookings().findOneAndUpdate(
    { _id, status: "Pending" },
    { $set: { status: "Cancelled", updatedAt: now() } },
    { returnDocument: "after" }
  );
  if (!updated) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.json({ success: true, data: updated });
});
