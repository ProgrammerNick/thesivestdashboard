import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getClient } from "../db/client";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const client = await getClient();
const db = drizzle(client || "", { schema });

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
  user: {
    additionalFields: {
      displayName: {
        type: "string",
        required: true,
        returned: true,
      },
    },
  },
});
