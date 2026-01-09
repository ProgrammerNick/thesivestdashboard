import { useState } from "react";
import { Search, Loader2, BrainCircuit, TrendingUp, AlertTriangle, Scale, Activity } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { motion, AnimatePresence } from "motion/react";
import { searchStock, StockData } from "../server/features/stocks";
import { Badge } from "./ui/badge";

export function StockSearch() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<StockData | null>(null);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await searchStock({
                data: query
            });
            setResult(data);
        } catch (err) {
            console.error(err);
            setError("Could not fetch stock data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="py-12 container mx-auto px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-heading text-foreground">
                        Institutional-Grade Stock Analysis
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Deep dive into any company. Our AI analyzes business quality, moats, and valuation in seconds.
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
                    />
                    <Button
                        size="lg"
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="rounded-lg px-8 font-semibold"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze"}
                    </Button>
                </Card>

                {/* Error State */}
                {error && (
                    <div className="text-center text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )}

                {/* Results View */}
                <AnimatePresence mode="wait">
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-4xl font-bold font-heading">{result.symbol}</h3>
                                        <Badge variant="outline" className="text-lg px-3 py-1">{result.companyName}</Badge>
                                    </div>
                                    <p className="text-muted-foreground mt-2 max-w-2xl">{result.businessSummary}</p>
                                </div>
                                <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                                    <BrainCircuit className="w-4 h-4" />
                                    AI Generated Analysis
                                </div>
                            </div>

                            {/* Main Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Moat Analysis */}
                                <Card className="p-6 bg-card border-border/60">
                                    <div className="flex items-center gap-2 mb-4 text-blue-500">
                                        <Scale className="w-5 h-5" />
                                        <h4 className="font-bold uppercase tracking-wider text-sm">Economic Moat</h4>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">{result.moatAnalysis}</p>
                                </Card>

                                {/* Growth Catalysts */}
                                <Card className="p-6 bg-card border-border/60">
                                    <div className="flex items-center gap-2 mb-4 text-green-500">
                                        <TrendingUp className="w-5 h-5" />
                                        <h4 className="font-bold uppercase tracking-wider text-sm">Growth Catalysts</h4>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">{result.growthCatalysts}</p>
                                </Card>

                                {/* Key Risks */}
                                <Card className="p-6 bg-card border-border/60">
                                    <div className="flex items-center gap-2 mb-4 text-red-500">
                                        <AlertTriangle className="w-5 h-5" />
                                        <h4 className="font-bold uppercase tracking-wider text-sm">Key Risks</h4>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">{result.keyRisks}</p>
                                </Card>

                                {/* Financials & Valuation */}
                                <Card className="p-6 bg-card border-border/60">
                                    <div className="flex items-center gap-2 mb-4 text-purple-500">
                                        <Activity className="w-5 h-5" />
                                        <h4 className="font-bold uppercase tracking-wider text-sm">Financials & Valuation</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs font-semibold text-foreground uppercase block mb-1">Health</span>
                                            <p className="text-muted-foreground text-sm">{result.financialHealth}</p>
                                        </div>
                                        <div className="pt-4 border-t border-border/40">
                                            <span className="text-xs font-semibold text-foreground uppercase block mb-1">Valuation Context</span>
                                            <p className="text-muted-foreground text-sm">{result.valuationCommentary}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
