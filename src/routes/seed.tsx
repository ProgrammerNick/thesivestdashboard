import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import * as schema from "@/db/schema";
import { db } from "@/db/index";

const seedData = createServerFn({ method: "POST" }).handler(async () => {
  // 1. Get current user
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return { success: false, message: "Not logged in. Please login to seed data for your profile." };
  }

  const userId = session.user.id;

  // 2. Insert Mock Posts
  const mocks = [
    {
      userId,
      title: "Why Nuclear Energy is the Future",
      content: "# The Bull Case for Uranium\n\nWith AI data centers demanding massive power, nuclear is the only base-load carbon-free solution.\n\nKey players:\n- **CCJ** (Cameco)\n- **URA** (ETF)\n\n> \"The energy transition is impossible without nuclear.\"",
      type: "thought" as const,
      symbol: "URA",
    },
    {
      userId,
      title: "Short Term TSLA Put",
      content: "Technical resistance at $250. RSI overbought. Looking for a pullback to $230.",
      type: "trade" as const,
      symbol: "TSLA",
      buyPrice: "248.50",
      targetPrice: "230.00",
      stopLoss: "255.00",
    },
    {
      userId,
      title: "Long NVDA into Earnings",
      content: "Demand for Blackwell chips remains insane. Supply chain checks indicate capacity is sold out through 2025.",
      type: "trade" as const,
      symbol: "NVDA",
      buyPrice: "115.20",
    }
  ];

  try {
    for (const post of mocks) {
      await db.insert(schema.post).values(post);
    }
    return { success: true, message: `Seeded ${mocks.length} posts for user ${session.user.name}` };
  } catch (e) {
    return { success: false, message: `Error seeding: ${e}` };
  }
});

export const Route = createFileRoute("/seed")({
  component: SeedPage,
});

function SeedPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
      <button
        onClick={async () => {
          const res = await seedData();
          alert(res.message);
        }}
        className="bg-primary text-primary-foreground px-4 py-2 rounded"
      >
        Seed Mock Data
      </button>
    </div>
  );
}
