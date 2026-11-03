import { MongoClient } from "mongodb";

let client = null;
let db = null;

/** Connect to MongoDB once, reuse the same connection across requests. */
export async function connectDB(uri) {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  await ensureIndexes(db);
  console.log(`✔ MongoDB connected → ${db.databaseName}`);
  return db;
}

/** Idempotent indexes previously auto-created by the Mongoose schemas. */
async function ensureIndexes(db) {
  await db.collection("studios").createIndexes([
    { key: { category: 1 } },
    { key: { ownerEmail: 1 } },
    { key: { createdAt: -1 } },
  ]);
  await db.collection("bookings").createIndexes([
    { key: { user: 1, status: 1 } },
    { key: { studio: 1 } },
  ]);
}

/** The connected native database; undefined until connectDB has resolved. */
export function getDB() {
  return db;
}

/** Close the connection — used by standalone scripts (seed, repair). */
export async function closeDB() {
  if (client) await client.close();
  client = null;
  db = null;
}
