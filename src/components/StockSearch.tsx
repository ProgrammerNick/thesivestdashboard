import { useState } from "react";
import { Search, Loader2, BrainCircuit, TrendingUp, AlertTriangle, Scale, Activity, Calendar, Target } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { motion, AnimatePresence } from "motion/react";
import { searchStock, StockData } from "../server/fn/stocks";
import { chatWithStock } from "../server/fn/stock-chat";
import { getSymbolPosts } from "../server/fn/posts";
import { Badge } from "./ui/badge";
import { ResearchChart } from "./ResearchChart";
import { getOrCreateChatSession, addChatMessage } from "../server/fn/chat-history";
import { authClient } from "../lib/auth-client";
import { CleanChatInterface } from "./CleanChatInterface";

export function StockSearch() {
    const { data: session } = authClient.useSession();
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<StockData | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError("");
        setResult(null);
        setPosts([]);
        setCurrentSessionId(null);

        try {
            const [stockData, postsData] = await Promise.all([
                searchStock({ data: query }),
                getSymbolPosts({ data: { symbol: query.toUpperCase() } })
            ]);

            setResult(stockData);
            setPosts(postsData);

            // Initialize chat session if user is logged in
            if (session?.user?.id) {
                const sessionData = await getOrCreateChatSession({
                    data: {
                        userId: session.user.id,
                        type: "stock",
                        contextId: stockData.symbol,
                        title: `${stockData.symbol} - ${stockData.companyName}`,
                    },
                });
                setCurrentSessionId(sessionData.id);
            }
        } catch (err) {
            console.error(err);
            setError("Could not fetch stock data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Build context from the analysis for chat
    const buildChatContext = () => {
        if (!result) return "";
        return `
Symbol: ${result.symbol}
Company: ${result.companyName}
Business: ${result.businessSummary}
Moat: ${result.moatAnalysis}
Growth Catalysts: ${result.growthCatalysts}
Key Risks: ${Array.isArray(result.keyRisks) ? result.keyRisks.join(", ") : result.keyRisks}
Financial Health: ${result.financialHealth}
Valuation: ${result.valuationCommentary}
Earnings Quality: ${result.earningsQuality}
Capital Allocation: ${result.capitalAllocation}
        `.trim();
    };

    const handleSendMessage = async (message: string): Promise<string> => {
        if (!result) return "Please search for a stock first.";

        // Ensure we have a session
        let sessionId = currentSessionId;
        if (!sessionId && session?.user?.id) {
            const sessionData = await getOrCreateChatSession({
                data: {
                    userId: session.user.id,
                    type: "stock",
                    contextId: result.symbol,
                    title: `${result.symbol} - ${result.companyName}`,
                },
            });
            sessionId = sessionData.id;
            setCurrentSessionId(sessionId);
        }

        // Save user message
        if (sessionId) {
            await addChatMessage({
                data: {
                    sessionId: sessionId,
                    role: "user",
                    content: message,
                },
            });
        }

        // Get AI response
        const response = await chatWithStock({
            data: {
                symbol: result.symbol,
                context: buildChatContext(),
                messages: [{ role: "user", content: message }],
            }
        });

        // Save AI response
        if (sessionId) {
            await addChatMessage({
                data: {
                    sessionId: sessionId,
                    role: "model",
                    content: response,
                },
            });
        }

        return response;
    };

    return (
        <section className="py-12 container mx-auto px-6">
            <div className="max-w-7xl mx-auto space-y-12">
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
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                                    <BrainCircuit className="w-4 h-4" />
                                    AI Generated Analysis
                                </div>
                            </div>

                            {/* Research Chart */}
                            <ResearchChart symbol={result.symbol} posts={posts} />

                            {/* Split View: Analysis + Chat */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* Analysis Column */}
                                <div className="space-y-6">
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

                                    {/* Upcoming Catalysts */}
                                    {result.upcomingCatalysts && (
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
                                                                    <Badge variant="secondary" className="text-xs">
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
                                    )}

                                    {/* Short Interest */}
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
                                </div>

                                {/* Chat Column */}
                                <div className="lg:sticky lg:top-24 h-[800px]">
                                    <CleanChatInterface
                                        onSendMessage={handleSendMessage}
                                        initialMessage={`I've analyzed ${result.companyName} (${result.symbol}). What would you like to know about this stock?`}
                                        placeholder={`Ask anything about ${result.symbol}...`}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
