import "dotenv/config";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";

const CLIENT_URLS = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Builds the BetterAuth instance once the Mongoose connection is live.
 *
 * - MongoDB adapter persists user/session/account/verification collections
 * - Email & password enabled (no email verification / forgot-password per spec)
 * - Google-only social login
 * - Cookie sessions; the jwt() plugin additionally exposes /api/auth/token
 *
 * onAPIError.errorURL sends failed OAuth callbacks (state mismatch, invalid
 * code, etc.) back to the frontend login page instead of leaving the user on
 * a bare API error page.
 */
export function initAuth(db) {
  const socialProviders =
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {};

  return betterAuth({
    database: mongodbAdapter(db),

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5010",
    trustedOrigins: CLIENT_URLS,

    onAPIError: {
      errorURL: `${CLIENT_URLS[0] || "http://localhost:3000"}/login`,
    },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      maxPasswordLength: 128,
    },
    socialProviders,

    plugins: [jwt()],
  });
}
