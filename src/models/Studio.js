import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

/**
 * Plain-MongoDB access to the studios collection (replaces the former
 * Mongoose model with simple CRUD + query operators).
 */

/** Collection accessor. */
export const studios = () => getDB().collection("studios");

/** Category values allowed on the field, same list the frontend offers. */
export const STUDIO_CATEGORIES = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
];

/** Fields returned for list views (former .select(LIST_FIELDS)). */
export const STUDIO_LIST_FIELDS = {
  title: 1,
  category: 1,
  hourlyRate: 1,
  location: 1,
  images: 1,
  rating: 1,
  reviewsCount: 1,
  createdAt: 1,
};

/** Fields attached to a booking's hydrated studio summary. */
export const STUDIO_BOOKING_FIELDS = {
  title: 1,
  images: 1,
  location: 1,
  hourlyRate: 1,
};

/** Cast a 24-hex id string to an ObjectId; null when malformed. */
export function castObjectId(id) {
  if (id instanceof ObjectId) return id;
  return typeof id === "string" && /^[0-9a-f]{24}$/i.test(id)
    ? new ObjectId(id)
    : null;
}
