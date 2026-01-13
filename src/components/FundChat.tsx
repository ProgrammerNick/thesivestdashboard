import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { chatWithFund } from "@/server/fn/chat";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { FundData } from "@/server/fn/funds";

interface Message {
    role: "user" | "model";
    content: string;
}

interface FundChatProps {
    fundData: FundData;
    fundName: string;
}

export function FundChat({ fundData, fundName }: FundChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Cache key for localStorage
    const getCacheKey = (name: string) => `thesivest_chat_fund_${name.replace(/\s+/g, '_').toLowerCase()}`;

    // Load cached messages on mount
    useEffect(() => {
        const cached = localStorage.getItem(getCacheKey(fundName));
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                    return; // Don't show initial greeting if we have cached messages
                }
            } catch (e) {
                console.error("Failed to parse cached fund chat:", e);
            }
        }

        // Show initial greeting if no cached messages
        setMessages([
            {
                role: "model",
                content: `Hi! I've analyzed ${fundName}'s latest activity. Ask me anything about their strategy, recent moves, or specific holdings.`
            }
        ]);
    }, [fundName]);

    // Save messages to localStorage when they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(getCacheKey(fundName), JSON.stringify(messages));
        }
    }, [messages, fundName]);

    // Clear chat history
    const handleClearHistory = () => {
        localStorage.removeItem(getCacheKey(fundName));
        setMessages([
            {
                role: "model",
                content: `Hi! I've analyzed ${fundName}'s latest activity. Ask me anything about their strategy, recent moves, or specific holdings.`
            }
        ]);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user" as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Prepare context from fundData
        const context = `
            Strategy: ${fundData.strategy}
            Conviction Thesis: ${fundData.convictionThesis}
            Recent Activity: ${fundData.recentActivity}
            Performance Outlook: ${fundData.performanceOutlook}
            Top Holdings: ${fundData.holdings.map(h => `${h.name} (${h.symbol}): ${h.percent}%`).join(", ")}
        `;

        try {
            const response = await chatWithFund({
                data: {
                    fundName,
                    context,
                    messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
                }
            });

            setMessages(prev => [...prev, { role: "model", content: response }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "model", content: "Sorry, I encountered an error answering that. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="h-[600px] flex flex-col border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Bot className="w-5 h-5 text-primary" />
                        AI Analyst Chat
                    </CardTitle>
                    {messages.length > 1 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearHistory}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
                <CardDescription>
                    Ask follow-up questions about this fund.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <Avatar className="w-8 h-8 border border-border">
                                    <AvatarFallback className={m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                                        {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={`rounded-lg p-3 max-w-[80%] text-sm leading-relaxed ${m.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-foreground"
                                        }`}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <Avatar className="w-8 h-8 border border-border">
                                    <AvatarFallback className="bg-muted">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-lg p-3 text-sm text-foreground italic opacity-70">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-border/50 bg-background/40">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            placeholder="Ask about specific holdings..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="flex-1 bg-background/50"
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
