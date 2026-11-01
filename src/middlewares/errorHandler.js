export function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(err, _req, res, _next) {
  // Mongoose validation / cast errors → readable messages
  if (err?.name === "ValidationError") {
    const first = Object.values(err.errors || {})[0];
    return res.status(400).json({ success: false, message: first?.message || "Validation failed" });
  }
  if (err?.name === "CastError") {
    return res.status(400).json({ success: false, message: "Malformed identifier" });
  }
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
}
