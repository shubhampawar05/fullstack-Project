/**
 * MongoDB Database Connection
 * Handles connection to MongoDB using Mongoose
 */

import mongoose from "mongoose";
import { dbConfig } from "@/lib/config";

// Don't check MONGODB_URI at module load time (allows build to succeed)
// Will check when connectDB() is actually called

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (
  global as typeof globalThis & {
    mongoose?: {
      conn: typeof mongoose | null;
      promise: Promise<typeof mongoose> | null;
    };
  }
).mongoose;

if (!cached) {
  cached = (
    global as typeof globalThis & {
      mongoose?: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      };
    }
  ).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Check MONGODB_URI when actually connecting (not at module load)
  const MONGODB_URI = dbConfig.mongodbUri || dbConfig.url;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define MONGODB_URI or DATABASE_URL in your .env file"
    );
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectDB;
