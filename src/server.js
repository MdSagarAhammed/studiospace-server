import "dotenv/config";
import { connectDB } from "./config/db.js";
import { initAuth } from "./lib/auth.js";
import { context } from "./server-context.js";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5010;
const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    console.error("✖ MONGODB_URI is missing — copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  const db = await connectDB(MONGODB_URI);

  // Build the BetterAuth instance against the live connection
  context.auth = initAuth(db);

  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`✔ StudioSpace API listening on http://localhost:${PORT}`);
    console.log(`   Auth:  http://localhost:${PORT}/api/auth`);
    console.log(`   CORS:  ${(process.env.CLIENT_URL || "http://localhost:3000")}`);
  });

  // Graceful shutdown
  for (const sig of ["SIGINT", "SIGTERM"]) {
    process.on(sig, () => {
      console.log(`\n${sig} received — shutting down…`);
      server.close(() => process.exit(0));
    });
  }
}

main().catch((err) => {
  console.error("✖ Failed to start server:", err.message);
  process.exit(1);
});
