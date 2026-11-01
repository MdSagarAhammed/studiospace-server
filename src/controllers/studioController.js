import { Studio } from "../models/Studio.js";
import { isOwner } from "../middlewares/ownershipMiddleware.js";

const LIST_FIELDS = "title category hourlyRate location images rating reviewsCount createdAt";
const handle = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Normalizes a studio payload from the client, ignoring spoofed ownership fields. */
function buildPayload(body, user) {
  return {
    title: body.title?.trim(),
    category: body.category,
    hourlyRate: Number(body.hourlyRate),
    securityDeposit: Number(body.securityDeposit || 0),
    maxCapacity: Number(body.maxCapacity),
    location: body.location?.trim(),
    images: (body.images || []).filter(Boolean).slice(0, 8),
    amenities: (body.amenities || []).slice(0, 30),
    overview: body.overview?.trim(),
    owner: user.id,
    ownerName: user.name,
    ownerEmail: user.email,
  };
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

  const data = await Studio.find(filter)
    .sort(sortMap[sort] || { createdAt: -1 })
    .select(LIST_FIELDS)
    .lean();

  res.json({ success: true, data });
});

// GET /api/studios/featured — top-rated, newest tie-break, limit 6
export const getFeatured = handle(async (_req, res) => {
  const data = await Studio.find()
    .sort({ rating: -1, createdAt: -1 })
    .select(LIST_FIELDS)
    .limit(6)
    .lean();
  res.json({ success: true, data });
});

// GET /api/studios/mine — listings owned by the session user
export const getMine = handle(async (req, res) => {
  const data = await Studio.find({ ownerEmail: req.user.email })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data });
});

// GET /api/studios/:id
export const getStudio = handle(async (req, res) => {
  const studio = await Studio.findById(req.params.id).lean();
  if (!studio) {
    return res.status(404).json({ success: false, message: "Studio not found" });
  }
  res.json({ success: true, data: studio });
});

// POST /api/studios (private)
export const createStudio = handle(async (req, res) => {
  const payload = buildPayload(req.body, req.user);
  if (!payload.title || !payload.category || !payload.overview || !payload.location || Number.isNaN(payload.hourlyRate) || Number.isNaN(payload.maxCapacity)) {
    return res.status(400).json({ success: false, message: "Missing required studio fields" });
  }
  const studio = await Studio.create(payload);
  res.status(201).json({ success: true, data: studio });
});

// PUT /api/studios/:id (private, ownership enforced)
export const updateStudio = handle(async (req, res) => {
  const studio = await Studio.findById(req.params.id);
  if (!studio) return res.status(404).json({ success: false, message: "Studio not found" });

  if (!isOwner(studio, req.user)) {
    return res.status(403).json({ success: false, message: "You can only update your own listings" });
  }

  const b = req.body;
  Object.assign(studio, {
    title: b.title?.trim() ?? studio.title,
    category: b.category ?? studio.category,
    hourlyRate: b.hourlyRate !== undefined ? Number(b.hourlyRate) : studio.hourlyRate,
    securityDeposit: b.securityDeposit !== undefined ? Number(b.securityDeposit) : studio.securityDeposit,
    maxCapacity: b.maxCapacity !== undefined ? Number(b.maxCapacity) : studio.maxCapacity,
    location: b.location?.trim() ?? studio.location,
    images: b.images ? b.images.filter(Boolean).slice(0, 8) : studio.images,
    amenities: b.amenities ? b.amenities.slice(0, 30) : studio.amenities,
    overview: b.overview?.trim() ?? studio.overview,
    // Read-only host info: owner fields are never taken from the request
  });

  await studio.save();
  res.json({ success: true, data: studio });
});

// DELETE /api/studios/:id (private, ownership enforced)
export const deleteStudio = handle(async (req, res) => {
  const studio = await Studio.findById(req.params.id);
  if (!studio) return res.status(404).json({ success: false, message: "Studio not found" });

  if (!isOwner(studio, req.user)) {
    return res.status(403).json({ success: false, message: "You can only delete your own listings" });
  }

  await studio.deleteOne();
  res.json({ success: true, data: { _id: req.params.id } });
});
