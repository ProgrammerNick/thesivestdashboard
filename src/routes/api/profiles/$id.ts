import { createFileRoute } from "@tanstack/react-router";
import { getUserProfile } from "../../../server/data-access/profiles";

export const Route = createFileRoute("/api/profiles/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const profile = await getUserProfile(params.id);

        if (!profile) {
          return new Response(JSON.stringify({ error: "Profile not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(profile), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
