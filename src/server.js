import "dotenv/config";
import app, { initializeBackend } from "./app.js";
import { CLIENT_URLS } from "./config/env.js";

const PORT = process.env.PORT || 5010;

async function main() {
  await initializeBackend();
  const server = app.listen(PORT, () => {
    console.log(`✔ StudioSpace API listening on http://localhost:${PORT}`);
    console.log(`   Auth:  http://localhost:${PORT}/api/backend/auth`);
    console.log(`   CORS:  ${CLIENT_URLS.join(", ")}`);
  });

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
