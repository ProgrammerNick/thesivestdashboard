import { useState } from "react";
import { Search, Loader2, BrainCircuit, Wallet, ArrowRight } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { motion, AnimatePresence } from "motion/react";
import { searchFund } from "../server/features/funds";

interface Holding {
    symbol: string;
    name: string;
    percent: number;
}

interface SearchResult {
    fundName: string;
    holdings: Holding[];
    strategy: string;
    recentActivity: string;
    performanceOutlook: string;
    convictionThesis: string;
}

export function FundSearch() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await searchFund({
                data: query
            });
            setResult(data);
        } catch (err) {
            console.error(err);
            setError("Could not fetch fund data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="py-20 container mx-auto px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">

                    <h2 className="text-3xl md:text-5xl font-heading text-foreground">
                        Decode Any Fund Strategy
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Search for a fund or manager. Our AI analyzes their latest holdings to reverse-engineer their investment thesis.
                    </p>
                </div>

                {/* Search Bar */}
                <Card className="p-2 flex flex-row items-center gap-2 border-primary/20 bg-background/50 backdrop-blur-sm shadow-xl max-w-2xl mx-auto">
                    <Search className="w-5 h-5 text-muted-foreground ml-3" />
                    <Input
                        placeholder="Search e.g. 'Ark Innovation', 'Berkshire', 'Bridgewater'..."
                        className="border-none shadow-none focus-visible:ring-0 text-lg py-6 bg-transparent"
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
                            className="grid lg:grid-cols-2 gap-8"
                        >
                            {/* Strategy Column - AI Analysis */}
                            <div className="space-y-6">
                                <Card className="p-8 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/0 to-transparent relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center gap-3 text-primary mb-2">
                                            <BrainCircuit className="w-6 h-6" />
                                            <span className="font-bold tracking-wider text-sm uppercase">Gemini AI Analysis</span>
                                        </div>

                                        <h3 className="text-2xl font-heading font-bold text-foreground">
                                            {result.fundName} Strategy
                                        </h3>

                                        <div className="prose dark:prose-invert">
                                            <p className="text-lg leading-relaxed text-muted-foreground">
                                                {result.strategy}
                                            </p>
                                        </div>

                                        <div className="pt-2">
                                            <Link to={`/funds/${encodeURIComponent(query)}`}>
                                                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                                                    Open Full Research Page <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6 bg-card/50 border-border/60">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Recent Activity</h4>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{result.recentActivity}</p>
                                </Card>

                                <Card className="p-6 bg-card/50 border-border/60">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Performance Context</h4>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{result.performanceOutlook}</p>
                                </Card>
                            </div>

                            {/* Holdings & Conviction Column */}
                            <div className="space-y-6">
                                <Card className="p-6 bg-card/50 border-border/60 h-auto">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Conviction Thesis</h4>
                                    <p className="text-muted-foreground text-sm leading-relaxed italic border-l-2 border-primary/20 pl-4">
                                        "{result.convictionThesis}"
                                    </p>
                                </Card>

                                <Card className="p-0 overflow-hidden border-border/50 bg-card/50">
                                    <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-5 h-5 text-muted-foreground" />
                                            <h3 className="font-semibold">Top Holdings Detected</h3>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-border/50">
                                        {result.holdings.map((holding) => (
                                            <div key={holding.symbol} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center font-bold text-sm">
                                                        {holding.symbol}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-foreground">{holding.name}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium tabular-nums">{holding.percent}%</div>
                                                    <div className="text-xs text-muted-foreground">Portfolio</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-muted/20 text-center">
                                        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Analysis generated just now based on latest available holdings.
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Holdings Card */}
                            <Card className="p-0 overflow-hidden border-border/50 bg-card/50">
                                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-muted-foreground" />
                                        <h3 className="font-semibold">Top Holdings Detected</h3>
                                    </div>
                                </div>
                                <div className="divide-y divide-border/50">
                                    {result.holdings.map((holding) => (
                                        <div key={holding.symbol} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center font-bold text-sm">
                                                    {holding.symbol}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground">{holding.name}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium tabular-nums">{holding.percent}%</div>
                                                <div className="text-xs text-muted-foreground">Portfolio</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-muted/20 text-center">
                                    <Button variant="ghost" className="text-xs text-muted-foreground hover:text-primary w-full">
                                        View All Holdings <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
