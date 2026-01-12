import { createFileRoute } from "@tanstack/react-router";
import { getUserTrades } from "../../../../server/data-access/profiles";

export const Route = createFileRoute("/api/profiles/$id/trade-history")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const url = new URL(request.url);
        const limit = url.searchParams.get("limit");
        const trades = await getUserTrades(
          params.id,
          limit ? parseInt(limit) : undefined
        );

        return new Response(JSON.stringify(trades), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
