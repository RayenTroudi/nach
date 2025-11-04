import mongoose from "mongoose";

let isConnected = false;

export const connectToDatabase = async () => {
  if (!process.env.MONGODB_URL) {
    console.error("MONGODB_URL is not defined in environment variables");
    throw new Error("MONGODB_URL is not defined");
  }

  if (isConnected) {
    console.log("Already Connected to MongoDB");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: process.env.DATABASE_NAME,
    });
    isConnected = true;
    console.log("MongoDB Connected Successfully");
  } catch (error: any) {
    console.error("MongoDB Connection Error:", error.message);
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
};
