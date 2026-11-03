import {
  studios,
  STUDIO_LIST_FIELDS,
  STUDIO_CATEGORIES,
  castObjectId,
} from "../models/Studio.js";
import { isOwner } from "../middlewares/ownershipMiddleware.js";

const handle = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const now = () => new Date();

/** Normalizes a studio payload from the client, ignoring spoofed ownership fields. */
function buildPayload(body, user) {
  return {
    title: body.title?.trim(),
    category: body.category,
    hourlyRate: Number(body.hourlyRate),
    securityDeposit: Number(body.securityDeposit ?? 0),
    maxCapacity: Number(body.maxCapacity),
    location: body.location?.trim(),
    images: (body.images || []).filter(Boolean).slice(0, 8),
    amenities: (body.amenities || []).slice(0, 30),
    overview: body.overview?.trim(),
    owner: castObjectId(user.id),
    ownerName: user.name,
    ownerEmail: (user.email || "").toLowerCase(),
  };
}

/** The numbers the field must carry (former schema min/max rules). */
function invalidNumbers(payload) {
  return (
    Number.isNaN(payload.hourlyRate) ||
    (payload.securityDeposit !== undefined && Number.isNaN(payload.securityDeposit)) ||
    Number.isNaN(payload.maxCapacity) ||
    payload.hourlyRate < 0 ||
    (payload.securityDeposit !== undefined && payload.securityDeposit < 0) ||
    payload.maxCapacity < 1
  );
}

// GET /api/studios?search=&category=&sort=newest|rating|price-asc|price-desc
export const listStudios = handle(async (req, res) => {
  const { search, category, sort = "newest" } = req.query;

  const filter = {};
  if (category && category !== "all") filter.category = category;
  if (search?.trim()) {
    const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { location: rx }];
  }

  const sortMap = {
    newest: { createdAt: -1 },
    rating: { rating: -1, reviewsCount: -1 },
    "price-asc": { hourlyRate: 1 },
    "price-desc": { hourlyRate: -1 },
  };

  const data = await studios()
    .find(filter, {
      projection: STUDIO_LIST_FIELDS,
      sort: sortMap[sort] || { createdAt: -1 },
    })
    .toArray();

  res.json({ success: true, data });
});

// GET /api/studios/featured — top-rated, newest tie-break, limit 6
export const getFeatured = handle(async (_req, res) => {
  const data = await studios()
    .find({}, { projection: STUDIO_LIST_FIELDS, sort: { rating: -1, createdAt: -1 }, limit: 6 })
    .toArray();
  res.json({ success: true, data });
});

// GET /api/studios/mine — listings owned by the session user
export const getMine = handle(async (req, res) => {
  const data = await studios()
    .find({ ownerEmail: (req.user.email || "").toLowerCase() }, { sort: { createdAt: -1 } })
    .toArray();
  res.json({ success: true, data });
});

// GET /api/studios/:id
export const getStudio = handle(async (req, res) => {
  const _id = castObjectId(req.params.id);
  const studio = _id ? await studios().findOne({ _id }) : null;
  if (!studio) {
    return res.status(404).json({ success: false, message: "Studio not found" });
  }
  res.json({ success: true, data: studio });
});

// POST /api/studios (private)
export const createStudio = handle(async (req, res) => {
  const payload = buildPayload(req.body, req.user);
  if (!payload.title || !payload.category || !payload.overview || !payload.location || invalidNumbers(payload)) {
    return res.status(400).json({ success: false, message: "Missing required studio fields" });
  }
  if (!STUDIO_CATEGORIES.includes(payload.category)) {
    return res.status(400).json({ success: false, message: "Invalid category" });
  }

  const doc = {
    ...payload,
    securityDeposit: payload.securityDeposit ?? 0,
    rating: 0,
    reviewsCount: 0,
    reviews: [],
    createdAt: now(),
    updatedAt: now(),
  };
  const inserted = await studios().insertOne(doc);
  res.status(201).json({ success: true, data: { ...doc, _id: inserted.insertedId } });
});

/** Key-value pairs the client may update; owner fields are never taken from the request. */
function buildUpdateSet(body) {
  const b = body;
  const $set = {};
  if (b.title !== undefined) $set.title = b.title?.trim();
  if (b.category !== undefined) $set.category = b.category;
  if (b.hourlyRate !== undefined) $set.hourlyRate = Number(b.hourlyRate);
  if (b.securityDeposit !== undefined) $set.securityDeposit = Number(b.securityDeposit);
  if (b.maxCapacity !== undefined) $set.maxCapacity = Number(b.maxCapacity);
  if (b.location !== undefined) $set.location = b.location?.trim();
  if (b.images !== undefined) $set.images = (b.images || []).filter(Boolean).slice(0, 8);
  if (b.amenities !== undefined) $set.amenities = (b.amenities || []).slice(0, 30);
  if (b.overview !== undefined) $set.overview = b.overview?.trim();
  return $set;
}

// PUT /api/studios/:id (private, ownership enforced)
export const updateStudio = handle(async (req, res) => {
  const _id = castObjectId(req.params.id);
  const studio = _id ? await studios().findOne({ _id }) : null;
  if (!studio) return res.status(404).json({ success: false, message: "Studio not found" });

  if (!isOwner(studio, req.user)) {
    return res.status(403).json({ success: false, message: "You can only update your own listings" });
  }

  const $set = buildUpdateSet(req.body);
  if ($set.category !== undefined && !STUDIO_CATEGORIES.includes($set.category)) {
    return res.status(400).json({ success: false, message: "Invalid category" });
  }
  if (["hourlyRate", "maxCapacity"].some((k) => $set[k] !== undefined && Number.isNaN($set[k])) ||
    ($set.securityDeposit !== undefined && Number.isNaN($set.securityDeposit))) {
    return res.status(400).json({ success: false, message: "Missing required studio fields" });
  }
  $set.updatedAt = now();

  const updated = await studios().findOneAndUpdate({ _id }, { $set }, { returnDocument: "after" });
  if (!updated) return res.status(404).json({ success: false, message: "Studio not found" });
  res.json({ success: true, data: updated });
});

// DELETE /api/studios/:id (private, ownership enforced)
export const deleteStudio = handle(async (req, res) => {
  const _id = castObjectId(req.params.id);
  const studio = _id ? await studios().findOne({ _id }) : null;
  if (!studio) return res.status(404).json({ success: false, message: "Studio not found" });

  if (!isOwner(studio, req.user)) {
    return res.status(403).json({ success: false, message: "You can only delete your own listings" });
  }

  await studios().deleteOne({ _id });
  res.json({ success: true, data: { _id: req.params.id } });
});
