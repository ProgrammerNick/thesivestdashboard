import { createFileRoute } from "@tanstack/react-router";
import { getUserPerformanceMetrics } from "../../../../server/data-access/profiles";

export const Route = createFileRoute("/api/profiles/$id/performance")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const metrics = await getUserPerformanceMetrics(params.id);

        return new Response(JSON.stringify(metrics), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
