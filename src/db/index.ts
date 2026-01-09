import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Resource } from "sst";

import * as schema from "./schema.ts";

// Debug: Check what Resource looks like
console.log("Resource:", Resource);
console.log("VITE_DATABASE_URL_POOLER:", Resource.VITE_DATABASE_URL_POOLER);

// Get the database URL with optional chaining
const dbUrl = Resource.VITE_DATABASE_URL_POOLER?.value || process.env.VITE_DATABASE_URL_POOLER || process.env.DATABASE_URL;

console.log("dbUrl:", dbUrl);

// Safe initialization
let dbInstance: any;

try {
  if (!dbUrl || typeof dbUrl !== "string") {
    console.warn("⚠️ Database URL is missing or invalid. DB operations will fail.");
  } else {
    dbInstance = drizzle(dbUrl, { schema });
    console.log("✅ db initialized successfully");
  }
} catch (err) {
  console.error("❌ Error initializing db:", err);
}

// Export a proxy that throws if db failed to init
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get: (_target, prop) => {
    if (!dbInstance) {
      throw new Error(`Database not initialized. check VITE_DATABASE_URL_POOLER. URL: ${dbUrl}`);
    }
    return (dbInstance as any)[prop];
  },
});

console.log("db initialized successfully");
