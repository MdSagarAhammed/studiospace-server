export function isOwner(doc, user) {
  if (!doc || !user) return false;
  if (doc.ownerEmail && doc.ownerEmail === user.email) return true;
  if (doc.owner) {
    const ownerId = typeof doc.owner === "object" ? String(doc.owner._id) : String(doc.owner);
    return ownerId === String(user.id);
  }
  return false;
}
