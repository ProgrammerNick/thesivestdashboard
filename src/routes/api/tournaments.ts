import { createFileRoute } from "@tanstack/react-router";
import { getTournaments } from "../../server/features/tournaments";

export const Route = createFileRoute("/api/tournaments")({
  server: {
    handlers: {
      GET: async () => {
        const tournaments = await getTournaments();
        return new Response(JSON.stringify(tournaments), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
    },
  },
});
