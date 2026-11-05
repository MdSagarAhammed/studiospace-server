import { context } from "../server-context.js";

export async function requireAuth(req, res, next) {
  const session = await context.auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return res
      .status(401)
      .json({ success: false, message: "Please log in to continue" });
  }
  req.user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };
  next();
}
