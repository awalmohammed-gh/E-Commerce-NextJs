import mongoose from "mongoose";

export async function connectMongodb() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(uri, {
    dbName: "eleoka-shop",
    serverSelectionTimeoutMS: 10_000,
  });

  return mongoose.connection;
}
