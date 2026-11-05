import { MongoClient } from "mongodb";

let client = null;
let db = null;

export async function connectDB(uri) {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  await ensureIndexes(db);
  console.log(`✔ MongoDB connected → ${db.databaseName}`);
  return db;
}

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

export function getDB() {
  return db;
}

export async function closeDB() {
  if (client) await client.close();
  client = null;
  db = null;
}
