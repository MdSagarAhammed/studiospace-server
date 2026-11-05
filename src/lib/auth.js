import "dotenv/config";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { CLIENT_URLS, getBetterAuthUrl } from "../config/env.js";

export function initAuth(db) {
  const isProduction = process.env.NODE_ENV === "production";
  const socialProviders =
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            disableImplicitSignUp: true,
          },
        }
      : {};

  return betterAuth({
    database: mongodbAdapter(db),

    baseURL: getBetterAuthUrl(),
    trustedOrigins: CLIENT_URLS,
    account: {
      storeStateStrategy: "cookie",
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
      },
    },

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
      autoSignIn: false,
      minPasswordLength: 6,
      maxPasswordLength: 128,
    },
    socialProviders,

    plugins: [jwt()],
  });
}
