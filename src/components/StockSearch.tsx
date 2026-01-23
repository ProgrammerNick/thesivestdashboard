import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { searchStock, StockData } from "@/server/fn/stocks";
import { StockDetailPanel } from "./StockDetailPanel";
import { StockChatSlidePanel } from "./StockChatSlidePanel";

export function StockSearch() {
    const [query, setQuery] = useState("");
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError("");

        try {
            const data = await searchStock({ data: query.toUpperCase() });
            setStockData(data);
            setIsDetailOpen(true);
            setQuery("");
        } catch (err) {
            console.error("Stock search failed", err);
            setError("Failed to analyze stock. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="py-12 container mx-auto px-6 overflow-hidden transition-all duration-300">
            <div className={`max-w-7xl mx-auto space-y-12 transition-all duration-300 ${isChatOpen ? "mr-[600px]" : "mr-auto"}`}>
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-heading text-foreground">
                        Institutional-Grade Stock Analysis
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Deep dive into any company. Visualize community thesis stamped directly on the chart.
                    </p>
                </div>

                {/* Search Bar */}
                <Card className="p-2 flex flex-row items-center gap-2 border-primary/20 bg-background/50 backdrop-blur-sm shadow-xl max-w-2xl mx-auto">
                    <Search className="w-5 h-5 text-muted-foreground ml-3" />
                    <Input
                        placeholder="Search ticker e.g. 'AAPL', 'MSFT', 'NVDA'..."
                        className="border-none shadow-none focus-visible:ring-0 text-lg py-6 bg-transparent flex-1"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button
                        size="lg"
                        onClick={handleSearch}
                        className="rounded-lg px-8 font-semibold"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze"}
                    </Button>
                </Card>

                {error && (
                    <div className="max-w-xl mx-auto text-center text-red-500 bg-red-500/10 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Inline Detail Panel - Appears below search when active */}
                {isDetailOpen && stockData && (
                    <StockDetailPanel
                        stock={stockData}
                        onAskAI={() => setIsChatOpen(true)}
                        onClose={() => setIsDetailOpen(false)}
                    />
                )}
            </div>

            {/* Slide-over Chat Panel */}
            {stockData && (
                <StockChatSlidePanel
                    stock={stockData}
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </section>
    );
}
