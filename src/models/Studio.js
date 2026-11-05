import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";


export const studios = () => getDB().collection("studios");

export const STUDIO_CATEGORIES = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
];

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

export const STUDIO_BOOKING_FIELDS = {
  title: 1,
  images: 1,
  location: 1,
  hourlyRate: 1,
};

export function castObjectId(id) {
  if (id instanceof ObjectId) return id;
  return typeof id === "string" && /^[0-9a-f]{24}$/i.test(id)
    ? new ObjectId(id)
    : null;
}
