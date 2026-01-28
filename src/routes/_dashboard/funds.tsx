import { createFileRoute } from "@tanstack/react-router";
import { FundSearch } from "@/components/FundSearch";

export const Route = createFileRoute("/_dashboard/funds")({
    component: FundResearchPage,
});

function FundResearchPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-heading font-bold">
                    Fund Research
                </h1>
            </div>

            <FundSearch />
        </div>
    );
}
