import "dotenv/config";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is required. Set it in the backend environment first.");
}

const apply = process.argv.includes("--apply");

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const accounts = db.collection("account");
  const users = db.collection("user");

  const orphaned = await accounts
    .find({ providerId: "google" }, { projection: { _id: 1, userId: 1 } })
    .toArray();
  const orphanIds = [];

  for (const account of orphaned) {
    const owner = await users.findOne({ _id: account.userId }, { projection: { _id: 1 } });
    if (!owner) orphanIds.push(account._id);
  }

  if (orphanIds.length === 0) {
    console.log("No orphaned Google account records found.");
  } else if (!apply) {
    console.log(`Found ${orphanIds.length} orphaned Google account record(s). Nothing was deleted.`);
    console.log("Review the target database, then rerun with --apply to remove only these orphan records.");
  } else {
    const result = await accounts.deleteMany({
      _id: { $in: orphanIds },
      providerId: "google",
    });
    console.log(`Removed ${result.deletedCount} orphaned Google account record(s).`);
  }
} finally {
  await client.close();
}
