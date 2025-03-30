/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

// Global variable to store connection state
const cached = global as any;

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

async function connectToDatabase(): Promise<mongoose.Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Connection retry is handled automatically in newer MongoDB driver versions
    };

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected, attempting to reconnect...");
    });

    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.log("MongoDB connection error: ", err);
    });

    cached.promise = mongoose
      .connect(MONGODB_URI as string, opts)
      .then((mongoose) => {
        return mongoose.connection;
      })
      .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
        // Clear the promise to allow retry on next call
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // If connection fails, reset promise to try again next time
    cached.promise = null;
    throw error;
  }
}

export default connectToDatabase;
