import { getDB } from "../config/db.js";

/**
 * Plain-MongoDB access to the bookings collection (replaces the former
 * Mongoose model with simple CRUD + query operators).
 */

/** Collection accessor. */
export const bookings = () => getDB().collection("bookings");

/** Status values allowed on the field. */
export const BOOKING_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

/** Fields needed to check time-slot conflicts with existing bookings. */
export const BOOKING_SLOT_FIELDS = { date: 1, startTime: 1, hours: 1 };
