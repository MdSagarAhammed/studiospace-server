/**
 * Late-binding holder for the BetterAuth instance.
 * `auth` is constructed after the MongoDB connection opens, so routes and
 * middlewares pull it from here instead of a static import.
 */
export const context = { auth: null };
