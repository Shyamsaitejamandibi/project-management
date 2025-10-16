import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: typeof mongoose | undefined;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (global.__mongooseConn) return global.__mongooseConn;

  const uri =
    "mongodb+srv://shyamsaitejam_db_user:qUMOLD4tqKrIGvtM@cluster0.xt9uwed.mongodb.net";
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
