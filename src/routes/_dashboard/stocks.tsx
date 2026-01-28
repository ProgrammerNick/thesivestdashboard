import { createFileRoute } from "@tanstack/react-router";
import { StockSearch } from "@/components/StockSearch";

export const Route = createFileRoute("/_dashboard/stocks")({
  component: StockResearchPage,
});

function StockResearchPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-heading font-bold">
          Stock Research
        </h1>
      </div>

      <StockSearch />
    </div>
  );
}
