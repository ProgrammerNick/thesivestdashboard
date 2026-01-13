import { useState, useRef, useEffect } from "react";
import { Search, Loader2, BrainCircuit, TrendingUp, AlertTriangle, Scale, Activity, Calendar, Target, Send, MessageSquare, Bot, User, Trash2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { motion, AnimatePresence } from "motion/react";
import { searchStock, StockData } from "../server/fn/stocks";
import { chatWithStock } from "../server/fn/stock-chat";
import { getSymbolPosts } from "../server/fn/posts";
import { Badge } from "./ui/badge";
import { ResearchChart } from "./ResearchChart";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface ChatMessage {
    role: "user" | "model";
    content: string;
}

export function StockSearch() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<StockData | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [error, setError] = useState("");

    // Chat state
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // Cache key for localStorage
    const getCacheKey = (symbol: string) => `thesivest_chat_stock_${symbol}`;

    // Load cached messages when result changes
    useEffect(() => {
        if (result?.symbol) {
            const cached = localStorage.getItem(getCacheKey(result.symbol));
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setChatMessages(parsed);
                    }
                } catch (e) {
                    console.error("Failed to parse cached chat:", e);
                }
            }
        }
    }, [result?.symbol]);

    // Save messages to localStorage when they change
    useEffect(() => {
        if (result?.symbol && chatMessages.length > 0) {
            localStorage.setItem(getCacheKey(result.symbol), JSON.stringify(chatMessages));
        }
    }, [chatMessages, result?.symbol]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError("");
        setResult(null);
        setPosts([]);
        setChatMessages([]); // Reset chat on new search (will load from cache if exists)

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

    const handleSendChat = async () => {
        if (!chatInput.trim() || !result) return;

        const userMessage: ChatMessage = { role: "user", content: chatInput };
        setChatMessages(prev => [...prev, userMessage]);
        setChatInput("");
        setIsChatLoading(true);

        try {
            const response = await chatWithStock({
                data: {
                    symbol: result.symbol,
                    context: buildChatContext(),
                    messages: [...chatMessages, userMessage],
                }
            });

            setChatMessages(prev => [...prev, { role: "model", content: response }]);
        } catch (err) {
            console.error("Chat error:", err);
            setChatMessages(prev => [...prev, { role: "model", content: "I encountered an error. Please try again." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    // Clear chat history for current stock
    const handleClearStockChat = () => {
        if (result?.symbol) {
            localStorage.removeItem(getCacheKey(result.symbol));
            setChatMessages([]);
        }
    };

    // Auto-scroll chat
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatMessages]);

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

                            {/* Chat Section for Follow-up Questions */}
                            <Card className="p-6 bg-card border-border/60">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <MessageSquare className="w-5 h-5" />
                                        <h4 className="font-bold uppercase tracking-wider text-sm">Ask Follow-up Questions</h4>
                                    </div>
                                    {chatMessages.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearStockChat}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Clear
                                        </Button>
                                    )}
                                </div>

                                {/* Chat Messages */}
                                {chatMessages.length > 0 && (
                                    <div
                                        ref={chatScrollRef}
                                        className="max-h-80 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-lg"
                                    >
                                        {chatMessages.map((msg, i) => (
                                            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                                                {msg.role === "model" && (
                                                    <Avatar className="w-8 h-8 bg-primary/10">
                                                        <AvatarFallback><Bot className="w-4 h-4 text-primary" /></AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                                    }`}>
                                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                </div>
                                                {msg.role === "user" && (
                                                    <Avatar className="w-8 h-8 bg-muted">
                                                        <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                        ))}
                                        {isChatLoading && (
                                            <div className="flex gap-3">
                                                <Avatar className="w-8 h-8 bg-primary/10">
                                                    <AvatarFallback><Bot className="w-4 h-4 text-primary" /></AvatarFallback>
                                                </Avatar>
                                                <div className="bg-muted p-3 rounded-lg">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Chat Input */}
                                <div className="flex gap-2">
                                    <Input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendChat()}
                                        placeholder={`Ask anything about ${result.symbol}...`}
                                        className="flex-1"
                                        disabled={isChatLoading}
                                    />
                                    <Button
                                        onClick={handleSendChat}
                                        disabled={isChatLoading || !chatInput.trim()}
                                    >
                                        <Send className="w-4 h-4" />
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
