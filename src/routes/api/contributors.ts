import { createFileRoute } from "@tanstack/react-router";
import {
  getContributors,
  getContributorAnalyses,
} from "../../server/features/contributors";

export const Route = createFileRoute("/api/contributors")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const limit = url.searchParams.get("limit");
        const analyses = url.searchParams.get("analyses") === "true";

        let data;
        if (analyses) {
          const analysesLimit = limit ? parseInt(limit, 10) : undefined;
          data = await getContributorAnalyses(analysesLimit);
        } else {
          data = await getContributors();
        }

        return new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
    },
  },
});
