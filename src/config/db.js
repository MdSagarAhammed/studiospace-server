import mongoose from "mongoose";

/** Connect to MongoDB once, cache the connection across hot reloads. */
export async function connectDB(uri) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log(`✔ MongoDB connected → ${mongoose.connection.name}`);
  return mongoose.connection;
}
