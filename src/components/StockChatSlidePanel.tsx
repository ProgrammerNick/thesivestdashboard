import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, X, Sparkles, PanelRight, ChevronFirst } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { getOrCreateChatSession, addChatMessage, getChatSession, generateChatSummary } from "@/server/fn/chat-history";
import { chatWithStock } from "@/server/fn/stock-chat";
import { CompactChatHistorySidebar } from "./CompactChatHistorySidebar";
import { authClient } from "@/lib/auth-client";
import { StockData } from "@/server/fn/stocks";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "model";
    content: string;
}

interface StockChatSlidePanelProps {
    stock: StockData;
    isOpen: boolean;
    onClose: () => void;
    sessionId: string | null;
}

export function StockChatSlidePanel({ stock, isOpen, onClose, sessionId }: StockChatSlidePanelProps) {
    const { data: session } = authClient.useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Use the passed sessionId or local state if we started one internally (fallback)
    const [internalSessionId, setInternalSessionId] = useState<string | null>(null);
    const activeSessionId = sessionId || internalSessionId;

    const [isInitializing, setIsInitializing] = useState(false);
    const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize or load existing session when stock changes or panel opens
    useEffect(() => {
        if (isOpen && session?.user?.id && stock) {
            if (sessionId) {
                // If ID passed from parent, load it
                loadSession(sessionId);
            } else {
                // Fallback if no ID passed (stand alone usage?)
                initializeSession();
            }
        }
    }, [isOpen, stock, session?.user?.id, sessionId]);

    const buildStarterSummary = (data: StockData) => {
        return `## ${data.companyName} (${data.symbol}) AI-powered Analysis

**Economic Moat**:
${data.moatAnalysis}

**Valuation & Peers**:
Trading at ${data.valuationCommentary}.
*Peers*: ${data.comparableMultiples?.map(c => `${c.ticker} (${c.peRatio} P/E)`).join(', ')}.

**Management Quality**:
${data.capitalAllocation}

**Key Risks**:
${Array.isArray(data.keyRisks) ? data.keyRisks.map(r => `- ${r}`).join('\n') : data.keyRisks}

**Upcoming Catalysts**:
${data.upcomingCatalysts?.map(c => `- ${c.event} (${c.date}) - ${c.impact}`).join('\n')}

I'm ready to discuss ${data.companyName} in depth. What specific aspect interests you?`;
    };

    const initializeSession = async () => {
        // If no user, just set initial message without persistence
        if (!session?.user?.id) {
            setMessages([
                {
                    role: "model",
                    content: buildStarterSummary(stock),
                },
            ]);
            return;
        }
        setIsInitializing(true);

        try {
            const result = await getOrCreateChatSession({
                data: {
                    userId: session.user.id,
                    type: "stock",
                    contextId: stock.symbol,
                    title: `${stock.symbol} Analysis`,
                },
            });

            setInternalSessionId(result.id);

            if (result.messages && result.messages.length > 0) {
                // Load existing messages
                setMessages(
                    result.messages.map((m: any) => ({
                        role: m.role as "user" | "model",
                        content: m.content,
                    }))
                );
                setHasUserSentMessage(true);
                // Keep sidebar closed on load as per user pref
                setIsSidebarOpen(false);
            } else {
                // New session - add detailed starter summary
                const greeting: Message = {
                    role: "model",
                    content: buildStarterSummary(stock),
                };
                setMessages([greeting]);

                // Save the greeting message immediately for history consistency
                await addChatMessage({
                    data: {
                        sessionId: result.id,
                        role: "model",
                        content: greeting.content,
                    },
                });
            }
        } catch (error) {
            console.error("Failed to initialize session:", error);
            // Fallback
            setMessages([
                {
                    role: "model",
                    content: buildStarterSummary(stock),
                },
            ]);
        } finally {
            setIsInitializing(false);
        }
    };


    // Load a specific session from history
    const loadSession = async (id: string) => {
        try {
            const sessionData = await getChatSession({ data: { sessionId: id } });
            if (sessionData) {
                if (!sessionId) setInternalSessionId(sessionData.id); // Only set internal if not using prop
                setMessages(
                    sessionData.messages.map((m: any) => ({
                        role: m.role as "user" | "model",
                        content: m.content,
                    }))
                );
                setHasUserSentMessage(true);
                setIsSidebarOpen(false);
            }
        } catch (error) {
            console.error("Failed to load session:", error);
        }
    };

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const buildChatContext = () => {
        return `
Symbol: ${stock.symbol}
Company: ${stock.companyName}
Business: ${stock.businessSummary}
Moat: ${stock.moatAnalysis}
Growth Catalysts: ${stock.growthCatalysts}
Key Risks: ${Array.isArray(stock.keyRisks) ? stock.keyRisks.join(", ") : stock.keyRisks}
Financial Health: ${stock.financialHealth}
Valuation: ${stock.valuationCommentary}
Earnings Quality: ${stock.earningsQuality}
Capital Allocation: ${stock.capitalAllocation}
Short Interest: ${stock.shortInterest || "Not notable"}
Upcoming Catalysts: ${stock.upcomingCatalysts?.map(c => `${c.event} on ${c.date} (${c.impact})`).join("; ")}
Peer Comparison: ${stock.comparableMultiples?.map(c => `${c.ticker}: ${c.peRatio} P/E`).join(", ")}
        `.trim();
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Auto-close sidebar on first user message
        if (!hasUserSentMessage) {
            setHasUserSentMessage(true);
            setIsSidebarOpen(false);
        }

        // Save user message
        if (activeSessionId) {
            addChatMessage({
                data: {
                    sessionId: activeSessionId,
                    role: "user",
                    content: userMessage.content,
                },
            }).catch(console.error);
        }

        try {
            const response = await chatWithStock({
                data: {
                    symbol: stock.symbol,
                    context: buildChatContext(),
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                },
            });

            const aiMessage: Message = { role: "model", content: response };
            setMessages((prev) => [...prev, aiMessage]);

            // Save AI response
            if (activeSessionId) {
                await addChatMessage({
                    data: {
                        sessionId: activeSessionId,
                        role: "model",
                        content: aiMessage.content,
                    },
                });

                // Generate summary after first exchange
                if (!hasUserSentMessage && messages.length <= 1) {
                    const allMessages = [...messages, userMessage, aiMessage];
                    generateChatSummary({
                        data: {
                            sessionId: activeSessionId,
                            messages: allMessages.map(m => ({
                                role: m.role,
                                content: m.content
                            }))
                        }
                    }).catch(console.error);
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "model",
                    content: "I encountered an error analyzing the data. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedQuestions = [
        `What are the 3 biggest risks?`,
        `Is the valuation attractive?`,
        `How strong is the moat?`,
        `Explain the growth catalysts.`,
    ];

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop - Removing backdrop so user can interact with side content if they want, or we can keep it transparent */}
            <div
                className="fixed inset-0 bg-transparent z-40"
                onClick={onClose}
            />

            {/* Chat Panel with Sidebar */}
            <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background border-l border-border shadow-2xl z-50 flex animate-in slide-in-from-right duration-300">
                {/* Main Chat Area */}
                <div className="flex flex-col flex-1 min-w-0">
                    {/* Header */}
                    <div className="border-b border-border bg-card/50 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{stock.symbol} AI-Powered Analyst</h3>
                                    <p className="text-xs text-muted-foreground">{stock.companyName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isSidebarOpen && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="gap-2"
                                    >
                                        <PanelRight className="w-4 h-4" />
                                        History
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <ScrollArea className="flex-1 p-4">
                        {isInitializing ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="max-w-3xl mx-auto space-y-6">
                                    {messages.map((m, i) => (
                                        <div
                                            key={i}
                                            className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                        >
                                            <div
                                                className={`rounded-lg px-3 py-2 max-w-[95%] text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-foreground mr-auto"
                                                    }`}
                                            >
                                                {m.role === "model" ? (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                        <ReactMarkdown
                                                            components={{
                                                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 my-1 space-y-0.5" {...props} />,
                                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 my-1 space-y-0.5" {...props} />,
                                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                                h3: ({ node, ...props }) => <h3 className="font-semibold text-foreground mt-3 mb-1 text-sm" {...props} />,
                                                                strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
                                                                p: ({ node, ...props }) => <p className="leading-relaxed my-1.5 last:mb-0" {...props} />,
                                                                table: ({ node, ...props }) => <div className="overflow-x-auto my-2"><table className="w-full text-xs border-collapse" {...props} /></div>,
                                                                th: ({ node, ...props }) => <th className="border border-border bg-muted/50 px-2 py-1 text-left font-semibold" {...props} />,
                                                                td: ({ node, ...props }) => <td className="border border-border px-2 py-1" {...props} />,
                                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/30 pl-4 italic my-2 bg-muted/30 py-1 rounded-r" {...props} />,
                                                            }}
                                                        >
                                                            {m.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p className="whitespace-pre-wrap">{m.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Loading indicator */}
                                    {isLoading && (
                                        <div className="flex gap-3">
                                            <div className="bg-muted rounded-xl p-3 text-sm text-muted-foreground ml-auto mr-auto">
                                                <span className="inline-flex gap-1">
                                                    <span className="animate-bounce [animation-delay:-0.3s]">●</span>
                                                    <span className="animate-bounce [animation-delay:-0.15s]">●</span>
                                                    <span className="animate-bounce">●</span>
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                            </div>
                        )}
                    </ScrollArea>

                    {/* Suggested Questions */}
                    {messages.length <= 1 && !isInitializing && (
                        <div className="px-4 pb-3 max-w-3xl mx-auto w-full">
                            <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedQuestions.map((q, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-7"
                                        onClick={() => {
                                            setInput(q);
                                            inputRef.current?.focus();
                                        }}
                                    >
                                        {q}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t border-border bg-card/50">
                        <div className="max-w-3xl mx-auto w-full">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <Input
                                    ref={inputRef}
                                    placeholder="Ask follow-up questions..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={isLoading || isInitializing}
                                    className="flex-1 bg-background"
                                />
                                <Button type="submit" size="icon" disabled={isLoading || !input.trim() || isInitializing}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Collapsible History Sidebar */}
                {isSidebarOpen && (
                    <div className="w-80 shrink-0 animate-in slide-in-from-right duration-200">
                        <CompactChatHistorySidebar
                            type="stock"
                            onSelectSession={loadSession}
                            currentSessionId={activeSessionId || undefined}
                            onClose={() => setIsSidebarOpen(false)}
                        />
                    </div>
                )}
            </div >
        </>
    );
}
