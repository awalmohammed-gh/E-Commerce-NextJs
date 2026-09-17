import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["1.1.1.1","1.0.0.1"]);

export const connectMongodb = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    await mongoose.connect(`${process.env.MONGODB_URI}/eleoka-shop`);

    console.log("MongoDB is connected");

    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
