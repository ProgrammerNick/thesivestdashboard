import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/profiles/$id/performance")({
  server: {
    handlers: {
      GET: async ({ params: _params }) => {
        // Performance metrics were removed from the schema
        // Return empty metrics as a placeholder
        return new Response(JSON.stringify([]), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
