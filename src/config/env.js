import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

function parseHttpUrl(value, name) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${name} must use http:// or https://`);
  }
  return url;
}

const configuredClientUrl = process.env.CLIENT_URL ||
  (isProduction ? "" : "http://localhost:3000");

if (!configuredClientUrl && isProduction) {
  throw new Error("CLIENT_URL is required in production");
}

export const CLIENT_URLS = configuredClientUrl
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => {
    const url = parseHttpUrl(value, "CLIENT_URL");
    if (isProduction && url.protocol !== "https:") {
      throw new Error("Production CLIENT_URL entries must use https://");
    }
    if (url.pathname !== "/" || url.search || url.hash) {
      throw new Error("CLIENT_URL entries must be origins without paths or query strings");
    }
    return url.origin;
  });

if (CLIENT_URLS.length === 0) {
  throw new Error("CLIENT_URL must contain at least one frontend origin");
}

export function getBetterAuthUrl() {
  const value = process.env.BETTER_AUTH_URL ||
    (isProduction ? "" : `http://localhost:${process.env.PORT || 5010}`);
  if (!value) throw new Error("BETTER_AUTH_URL is required in production");

  const url = parseHttpUrl(value, "BETTER_AUTH_URL");
  if (isProduction && url.protocol !== "https:") {
    throw new Error("Production BETTER_AUTH_URL must use https://");
  }
  if (url.search || url.hash) {
    throw new Error("BETTER_AUTH_URL cannot include a query string or fragment");
  }
  if (isProduction && !url.pathname.replace(/\/+$/, "").endsWith("/api/backend/auth")) {
    throw new Error("In production, BETTER_AUTH_URL must use the frontend /api/backend/auth proxy URL");
  }
  return url.toString().replace(/\/+$/, "");
}

export function validateBackendEnvironment() {
  const required = ["MONGODB_URI", "BETTER_AUTH_SECRET"];
  if (isProduction && !process.env.BETTER_AUTH_URL?.trim()) {
    required.push("BETTER_AUTH_URL");
  }
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(`Missing required backend environment variable(s): ${missing.join(", ")}`);
  }
  if (process.env.BETTER_AUTH_SECRET.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be at least 32 characters long");
  }
  if (!/^mongodb(?:\+srv)?:\/\//.test(process.env.MONGODB_URI)) {
    throw new Error("MONGODB_URI must start with mongodb:// or mongodb+srv://");
  }

  const hasGoogleId = Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
  const hasGoogleSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim());
  if (hasGoogleId !== hasGoogleSecret) {
    throw new Error("Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or leave both unset");
  }
}
