import { MongoClient, Db } from "mongodb";

// Ensure MONGODB_URI is defined
if (!process.env.MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable. For localhost: mongodb://localhost:27017/agency_portfolio"
  );
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Extend globalThis to include our MongoDB client promise
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export the client promise for advanced use cases
export default clientPromise;

// Database name from env or default
const DB_NAME = process.env.MONGODB_DB || "agency_portfolio";

/**
 * Get the database instance
 * Use this in Server Components and Server Actions
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

/**
 * Collection names - centralized for consistency
 */
export const COLLECTIONS = {
  SITE_CONFIG: "site_config",
  SEO_CONFIG: "seo_config",
  SERVICES: "services",
} as const;
