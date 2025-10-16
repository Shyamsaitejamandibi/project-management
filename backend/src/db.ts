import mongoose from "mongoose";
import "dotenv/config";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: typeof mongoose | undefined;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (global.__mongooseConn) return global.__mongooseConn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(uri, {
    dbName: "task_management",
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  global.__mongooseConn = mongoose;
  return mongoose;
}
