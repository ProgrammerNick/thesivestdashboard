import { createFileRoute } from "@tanstack/react-router";
import { StockSearch } from "@/components/StockSearch";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_dashboard/stocks")({
  component: StockResearchPage,
});

function StockResearchPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          Stock Research
        </h1>
        <p className="text-muted-foreground">
          Analyze stocks with AI models and view community thesis markers on the chart.
        </p>
      </div>

      <StockSearch />
    </div>
  );
}
