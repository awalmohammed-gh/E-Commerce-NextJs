import mongoose from "mongoose";

import dns from "dns";
dns.setServers(["1.1.1.1","8.8.8.8"])

export const connectMongodb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/eleoka-shop`);

    console.log("MongoDB is connected");
  } catch (error) {
    console.log("MongoDB connection error:", error);
    throw error;
  }
};
