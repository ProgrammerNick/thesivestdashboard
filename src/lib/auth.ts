import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getClient } from "../db/client";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const client = await getClient();

if (!client) {
  throw new Error("Failed to initialize database client in auth.ts. Check VITE_DATABASE_URL_POOLER.");
}

const db = drizzle(client, { schema });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      displayName: {
        type: "string",
        required: true,
        returned: true,
      },
    },
  },
  trustedOrigins: ["http://localhost:3000"],
});
