import assert from "node:assert/strict";
import test from "node:test";
import {
  bookingDateRange,
  bookingIntervalsOverlap,
  parseBookingStart,
} from "../src/lib/booking-validation.js";

test("booking start accepts real calendar dates and 24-hour times", () => {
  assert.equal(parseBookingStart("2026-11-05", "14:30"), Date.parse("2026-11-05T14:30:00Z"));
  assert.equal(parseBookingStart("2026-02-30", "14:30"), null);
  assert.equal(parseBookingStart("2026-11-05", "24:00"), null);
  assert.equal(parseBookingStart("05-11-2026", "14:30"), null);
});

test("booking intervals reject overlaps but allow adjacent reservations", () => {
  const start = Date.parse("2026-11-05T14:00:00Z");
  const end = start + 2 * 60 * 60 * 1000;

  assert.equal(bookingIntervalsOverlap(start, end, start + 60 * 60 * 1000, 1), true);
  assert.equal(bookingIntervalsOverlap(start, end, end, 1), false);
  assert.deepEqual(bookingDateRange(start, end), {
    from: "2026-11-04",
    through: "2026-11-05",
  });
});
