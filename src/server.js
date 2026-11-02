import "dotenv/config";
import app, { initializeBackend } from "./app.js";

const PORT = process.env.PORT || 5010;

async function main() {
  await initializeBackend();
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
