const HOUR_IN_MS = 60 * 60 * 1000;

export function parseBookingStart(date, startTime) {
  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    typeof startTime !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)
  ) {
    return null;
  }

  const timestamp = Date.parse(`${date}T${startTime}:00.000Z`);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== date
  ) {
    return null;
  }
  return timestamp;
}

export function bookingIntervalsOverlap(start, end, existingStart, existingHours) {
  const existingEnd = existingStart + existingHours * HOUR_IN_MS;
  return existingStart < end && start < existingEnd;
}

export function bookingDateRange(start, end) {
  const day = 24 * HOUR_IN_MS;
  return {
    from: new Date(start - day).toISOString().slice(0, 10),
    through: new Date(end).toISOString().slice(0, 10),
  };
}
