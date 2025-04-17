import mongoose from "mongoose";
import { log } from "../vite";

export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 1) {
      log("MongoDB is already connected", "mongodb");
      return;
    }
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI is not defined in the environment variables",
      );
    }
    await mongoose.connect(mongoUri);
    log(`Connected to MongoDB at ${mongoUri}`, "mongodb");
    mongoose.connection.on("error", (err) => {
      log(`MongoDB connection error: ${err}`, "mongodb");
    });
    mongoose.connection.on("disconnected", () => {
      log("MongoDB disconnected", "mongodb");
    });
    mongoose.connection.on("reconnected", () => {
      log("MongoDB reconnected", "mongodb");
    });
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      log("MongoDB connection closed through app termination", "mongodb");
      process.exit(0);
    });
  } catch (error) {
    log(`Error connecting to MongoDB: ${error}`, "mongodb");
    throw error;
  }
}
