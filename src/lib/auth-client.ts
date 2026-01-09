import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth"; // import as type only

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL, // or your specific URL
  plugins: [
    inferAdditionalFields<typeof auth>(), // Now TS knows about displayName on the client
  ],
});
