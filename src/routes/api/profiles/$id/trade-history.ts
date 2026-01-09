import { createFileRoute } from "@tanstack/react-router";
import { getUserTradeHistory } from "../../../../server/data-access/profiles";

export const Route = createFileRoute("/api/profiles/$id/trade-history")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const url = new URL(request.url);
        const limit = url.searchParams.get("limit");
        const tradeHistory = await getUserTradeHistory(
          params.id,
          limit ? parseInt(limit) : undefined
        );

        return new Response(JSON.stringify(tradeHistory), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
