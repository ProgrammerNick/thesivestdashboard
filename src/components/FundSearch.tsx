import { useState, useEffect } from "react";
import { Search, Loader2, BrainCircuit, Wallet, ArrowRight, Trash2, History } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";
import { Card } from "./ui/card";
import { motion, AnimatePresence } from "motion/react";
import { searchFund } from "../server/fn/funds";
import { getAnalysisHistory, deleteAnalysis } from "../server/fn/analysis";
import { authClient } from "@/lib/auth-client";

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
    ownershipConcentration: string;
    positionSizingLogic: string;
    cashPosition: string;
}

interface SavedAnalysis {
    id: string;
    query: string;
    result: string; // JSON string of SearchResult
    createdAt: Date;
}

export function FundSearch() {
    const { data: session } = authClient.useSession();
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [error, setError] = useState("");
    const [history, setHistory] = useState<SavedAnalysis[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    // Fetch history
    const loadHistory = async () => {
        if (session?.user?.id) {
            try {
                const data = await getAnalysisHistory({ data: { userId: session.user.id } });
                const fundHistory = (data as any[]).filter(item => item.type === 'fund');
                setHistory(fundHistory);
            } catch (e) {
                console.error("Failed to load history", e);
            }
        }
    };

    // Load history on mount
    useEffect(() => {
        loadHistory();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteAnalysis({ data: { id } });
            setHistory(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const handleHistoryClick = (item: SavedAnalysis) => {
        try {
            const parsed = JSON.parse(item.result);
            setResult(parsed);
            setQuery(item.query);
        } catch (e) {
            console.error("Failed to parse saved result", e);
        }
    };

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
            loadHistory(); // Reload history after new search (it saves automatically)

            // Initialize chat session if user is logged in
            if (session?.user?.id) {
                const sessionData = await getOrCreateChatSession({
                    data: {
                        userId: session.user.id,
                        type: "fund",
                        contextId: query,
                        title: `${data.fundName} Analysis`,
                    },
                });
                setCurrentSessionId(sessionData.id);
            }
        } catch (err) {
            console.error(err);
            setError("Could not fetch fund data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const buildFundContext = () => {
        if (!result) return "";
        return `
Fund: ${result.fundName}
Strategy: ${result.strategy}
Recent Activity: ${result.recentActivity}
Performance Outlook: ${result.performanceOutlook}
Conviction Thesis: ${result.convictionThesis}
Ownership Concentration: ${result.ownershipConcentration}
Position Sizing Logic: ${result.positionSizingLogic}
Cash Position: ${result.cashPosition}
Top Holdings: ${result.holdings.map(h => `${h.symbol} (${h.percent}%)`).join(", ")}
        `.trim();
    };

    const handleSendMessage = async (message: string): Promise<string> => {
        if (!result) return "Please search for a fund first.";

        // Ensure we have a session
        let sessionId = currentSessionId;
        if (!sessionId && session?.user?.id) {
            const sessionData = await getOrCreateChatSession({
                data: {
                    userId: session.user.id,
                    type: "fund",
                    contextId: query,
                    title: `${result.fundName} Analysis`,
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
        const response = await chatWithFund({
            data: {
                fundName: result.fundName,
                context: buildFundContext(),
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
                                            <Link to="/funds/$id" params={{ id: query }}>
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

                                <Card className="p-6 bg-card/50 border-border/60">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-blue-500 mb-3">Ownership Concentration</h4>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{result.ownershipConcentration}</p>
                                </Card>

                                <Card className="p-6 bg-card/50 border-border/60">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-amber-500 mb-3">Position Sizing Logic</h4>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{result.positionSizingLogic}</p>
                                </Card>

                                <Card className="p-6 bg-card/50 border-border/60">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-green-500 mb-3">Cash Position</h4>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{result.cashPosition}</p>
                                </Card>
                            </div>

                            {/* Chat Column */}
                            <div className="lg:sticky lg:top-24 h-[800px]">
                                <CleanChatInterface
                                    onSendMessage={handleSendMessage}
                                    initialMessage={`I've analyzed ${result.fundName}'s investment strategy and holdings. What would you like to know about this fund?`}
                                    placeholder={`Ask anything about ${result.fundName}...`}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* History Section */}
                {history.length > 0 && (
                    <div className="pt-10 border-t border-border/50">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-muted-foreground">
                            <History className="w-5 h-5" /> Recent Research
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {history.map((item) => (
                                <Card
                                    key={item.id}
                                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group relative"
                                    onClick={() => handleHistoryClick(item)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-lg">{item.query}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                                            onClick={(e) => handleDelete(item.id, e)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
