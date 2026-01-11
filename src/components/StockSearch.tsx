import { useState } from "react";
import { Search, Loader2, BrainCircuit, TrendingUp, AlertTriangle, Scale, Activity, Calendar, Target } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { motion, AnimatePresence } from "motion/react";
import { searchStock, StockData } from "../server/fn/stocks";
import { getSymbolPosts } from "../server/fn/posts";
import { Badge } from "./ui/badge";
import { ResearchChart } from "./ResearchChart";

export function StockSearch() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<StockData | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError("");
        setResult(null);
        setPosts([]);

        try {
            const [stockData, postsData] = await Promise.all([
                searchStock({ data: query }),
                getSymbolPosts({ data: { symbol: query.toUpperCase() } })
            ]);

            setResult(stockData);
            setPosts(postsData);
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

                            {/* Research Chart with Stamping */}
                            <ResearchChart symbol={result.symbol} posts={posts} />

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
                                    <ul className="space-y-2">
                                        {Array.isArray(result.keyRisks) ? result.keyRisks.map((risk, i) => (
                                            <li key={i} className="flex items-start gap-2 text-muted-foreground leading-relaxed">
                                                <span className="text-red-500 mt-1">•</span>
                                                <span>{risk}</span>
                                            </li>
                                        )) : <li className="text-muted-foreground">{result.keyRisks}</li>}
                                    </ul>
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

                                {/* Capital Allocation */}
                                <Card className="p-6 bg-card border-border/60">
                                    <div className="flex items-center gap-2 mb-4 text-amber-500">
                                        <Activity className="w-5 h-5" />
                                        <h4 className="font-bold uppercase tracking-wider text-sm">Capital Allocation</h4>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">{result.capitalAllocation}</p>
                                </Card>

                                {/* Earnings Quality */}
                                <Card className="p-6 bg-card border-border/60">
                                    <div className="flex items-center gap-2 mb-4 text-cyan-500">
                                        <Activity className="w-5 h-5" />
                                        <h4 className="font-bold uppercase tracking-wider text-sm">Earnings Quality</h4>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">{result.earningsQuality}</p>
                                </Card>

                                {/* Upcoming Catalysts */}
                                <Card className="p-6 bg-card border-border/60">
                                    <div className="flex items-center gap-2 mb-4 text-orange-500">
                                        <Calendar className="w-5 h-5" />
                                        <h4 className="font-bold uppercase tracking-wider text-sm">Upcoming Catalysts</h4>
                                    </div>
                                    {Array.isArray(result.upcomingCatalysts) ? (
                                        <div className="space-y-3">
                                            {result.upcomingCatalysts.map((catalyst, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-foreground">{catalyst.event}</span>
                                                            <Badge variant={catalyst.impact?.toLowerCase().includes('bullish') ? 'default' : catalyst.impact?.toLowerCase().includes('bearish') ? 'destructive' : 'secondary'} className="text-xs">
                                                                {catalyst.impact?.split(' ')[0] || 'Neutral'}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">{catalyst.date}</div>
                                                        <p className="text-sm text-muted-foreground mt-1">{catalyst.impact}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-muted-foreground">{result.upcomingCatalysts}</p>}
                                </Card>

                                {/* Short Interest - Only show if notable */}
                                {result.shortInterest && (
                                    <Card className="p-6 bg-card border-border/60">
                                        <div className="flex items-center gap-2 mb-4 text-yellow-500">
                                            <Target className="w-5 h-5" />
                                            <h4 className="font-bold uppercase tracking-wider text-sm">Short Interest</h4>
                                            <Badge variant="outline" className="text-xs">Notable</Badge>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">{result.shortInterest}</p>
                                    </Card>
                                )}

                                {/* Comparable Multiples Table */}
                                <Card className="p-6 bg-card border-border/60 md:col-span-2">
                                    <div className="flex items-center gap-2 mb-4 text-indigo-500">
                                        <Scale className="w-5 h-5" />
                                        <h4 className="font-bold uppercase tracking-wider text-sm">Comparable Multiples</h4>
                                    </div>
                                    {Array.isArray(result.comparableMultiples) && result.comparableMultiples.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-border/60">
                                                        <th className="text-left py-2 px-3 font-semibold text-foreground">Ticker</th>
                                                        <th className="text-left py-2 px-3 font-semibold text-foreground">Company</th>
                                                        <th className="text-right py-2 px-3 font-semibold text-foreground">P/E</th>
                                                        <th className="text-right py-2 px-3 font-semibold text-foreground">EV/EBITDA</th>
                                                        <th className="text-left py-2 px-3 font-semibold text-foreground">vs {result.symbol}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {result.comparableMultiples.map((comp, i) => (
                                                        <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                                            <td className="py-2 px-3 font-mono font-medium text-primary">{comp.ticker}</td>
                                                            <td className="py-2 px-3 text-muted-foreground">{comp.name}</td>
                                                            <td className="py-2 px-3 text-right font-mono">{comp.peRatio}</td>
                                                            <td className="py-2 px-3 text-right font-mono">{comp.evEbitda}</td>
                                                            <td className="py-2 px-3 text-muted-foreground text-sm">{comp.premium}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : <p className="text-muted-foreground">{String(result.comparableMultiples)}</p>}
                                </Card>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
