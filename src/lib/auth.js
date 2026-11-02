import "dotenv/config";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { CLIENT_URLS, getBetterAuthUrl } from "../config/env.js";

/**
 * Builds the BetterAuth instance once the Mongoose connection is live.
 *
 * - MongoDB adapter persists user/session/account/verification collections
 * - Email & password enabled (no email verification / forgot-password per spec)
 * - Google-only social login
 * - Cookie sessions; the jwt() plugin additionally exposes /api/backend/auth/token
 *
 * onAPIError.errorURL sends failed OAuth callbacks (state mismatch, invalid
 * code, etc.) back to the frontend login page instead of leaving the user on
 * a bare API error page.
 */
export function initAuth(db) {
  const isProduction = process.env.NODE_ENV === "production";
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

    baseURL: getBetterAuthUrl(),
    trustedOrigins: CLIENT_URLS,

    // Browser requests reach the API through a same-origin frontend proxy.
    // Keep cookies secure in production HTTPS while allowing local HTTP dev.
    advanced: {
      defaultCookieAttributes: isProduction
        ? { sameSite: "lax", secure: true }
        : { sameSite: "lax", secure: false },
    },

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
