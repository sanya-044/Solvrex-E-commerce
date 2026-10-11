import { MongoClient } from "mongodb";

const options = {
  serverSelectionTimeoutMS: 10000,
};

declare global {
  var _mongoClientPromise:
    | Promise<MongoClient>
    | undefined;
}

const clientPromise = Promise.resolve().then(() => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Please add MONGODB_URI to your environment variables."
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri, options).connect();
    }

    return global._mongoClientPromise;
  }

  return new MongoClient(uri, options).connect();
});

export default clientPromise;
