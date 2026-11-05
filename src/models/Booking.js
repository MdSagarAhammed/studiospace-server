import { getDB } from "../config/db.js";


export const bookings = () => getDB().collection("bookings");

export const BOOKING_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

export const BOOKING_SLOT_FIELDS = { date: 1, startTime: 1, hours: 1 };
