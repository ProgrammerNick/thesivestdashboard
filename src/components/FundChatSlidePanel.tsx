import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, X, Sparkles, PanelRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { chatWithFund } from "@/server/fn/chat";
import { getOrCreateChatSession, addChatMessage, getChatSession, generateChatSummary } from "@/server/fn/chat-history";
import { CompactChatHistorySidebar } from "./CompactChatHistorySidebar";
import { InstitutionalFund } from "@/server/data/fund-data";
import { authClient } from "@/lib/auth-client";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "model";
    content: string;
}

interface FundChatSlidePanelProps {
    fund: InstitutionalFund;
    isOpen: boolean;
    onClose: () => void;
}

export function FundChatSlidePanel({ fund, isOpen, onClose }: FundChatSlidePanelProps) {
    const { data: session } = authClient.useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize or load existing session when fund changes or panel opens
    useEffect(() => {
        if (isOpen && session?.user?.id && fund) {
            initializeSession();
        }
    }, [isOpen, fund, session?.user?.id]);

    const initializeSession = async () => {
        // If no user, just set initial message without persistence
        if (!session?.user?.id) {
            setMessages([
                {
                    role: "model",
                    content: `I've analyzed ${fund.name}'s latest 13F filing and portfolio. Their top position is ${fund.topHoldings[0]?.symbol} at ${fund.topHoldings[0]?.percent}% of the portfolio. What would you like to know about their strategy or positions?`,
                },
            ]);
            return;
        }
        setIsInitializing(true);

        try {
            const result = await getOrCreateChatSession({
                data: {
                    userId: session.user.id,
                    type: "fund-intelligence",
                    contextId: fund.id,
                    title: `${fund.name} Analysis`,
                },
            });

            setCurrentSessionId(result.id);

            if (result.messages && result.messages.length > 0) {
                // Load existing messages
                setMessages(
                    result.messages.map((m: any) => ({
                        role: m.role as "user" | "model",
                        content: m.content,
                    }))
                );
                // If there are existing messages, user has already sent messages
                setHasUserSentMessage(true);
                setIsSidebarOpen(false);
            } else {
                // New session - add initial greeting
                const greeting: Message = {
                    role: "model",
                    content: `I've analyzed ${fund.name}'s latest 13F filing and portfolio. Their top position is ${fund.topHoldings[0]?.symbol} at ${fund.topHoldings[0]?.percent}% of the portfolio. What would you like to know about their strategy or positions?`,
                };
                setMessages([greeting]);

                // Save the greeting message
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
            // Fallback to non-persisted greeting
            setMessages([
                {
                    role: "model",
                    content: `I've analyzed ${fund.name}'s latest 13F filing and portfolio. Their top position is ${fund.topHoldings[0]?.symbol} at ${fund.topHoldings[0]?.percent}% of the portfolio. What would you like to know about their strategy or positions?`,
                },
            ]);
        } finally {
            setIsInitializing(false);
        }
    };

    // Load a specific session from history
    const loadSession = async (sessionId: string) => {
        try {
            const sessionData = await getChatSession({ data: { sessionId } });
            if (sessionData) {
                setCurrentSessionId(sessionData.id);
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
        if (currentSessionId) {
            addChatMessage({
                data: {
                    sessionId: currentSessionId,
                    role: "user",
                    content: userMessage.content,
                },
            }).catch(console.error);
        }

        // Build context from fund data
        const context = `
      Fund: ${fund.name}
      Manager: ${fund.manager}
      AUM: ${fund.aum}
      Strategy: ${fund.strategy}
      Philosophy: ${fund.philosophy}
      Focus Areas: ${fund.focus.join(", ")}
      Top Holdings: ${fund.topHoldings.map((h) => `${h.name} (${h.symbol}): ${h.percent}%`).join(", ")}
      Recent Moves: ${fund.recentMoves.map((m) => `${m.action} ${m.ticker}: ${m.shares} (${m.value})`).join(", ")}
      Quarterly Return: ${fund.quarterlyReturn}%
      YTD Return: ${fund.ytdReturn}%
    `;

        try {
            const response = await chatWithFund({
                data: {
                    fundName: fund.name,
                    context,
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                },
            });

            const aiMessage: Message = { role: "model", content: response };
            setMessages((prev) => [...prev, aiMessage]);

            // Save AI response
            if (currentSessionId) {
                await addChatMessage({
                    data: {
                        sessionId: currentSessionId,
                        role: "model",
                        content: aiMessage.content,
                    },
                });

                // Generate summary after first exchange (user + AI response)
                if (!hasUserSentMessage && messages.length <= 1) {
                    const allMessages = [...messages, userMessage, aiMessage];
                    generateChatSummary({
                        data: {
                            sessionId: currentSessionId,
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

    // Suggested questions
    const suggestedQuestions = [
        `What's ${fund.name}'s investment thesis?`,
        `Analyze their top holding ${fund.topHoldings[0]?.symbol}`,
        `What recent changes have they made?`,
        `How does their strategy compare to peers?`,
    ];

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
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
                                    <h3 className="font-semibold">AI Fund Analyst</h3>
                                    <p className="text-xs text-muted-foreground">Analyzing {fund.name}</p>
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
                            <div className="space-y-4">
                                {messages.map((m, i) => (
                                    <div
                                        key={i}
                                        className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        <Avatar className="w-8 h-8 border border-border shrink-0">
                                            <AvatarFallback
                                                className={m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}
                                            >
                                                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div
                                            className={`rounded-xl p-3 max-w-[90%] text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                                }`}
                                        >
                                            {m.role === "model" ? (
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown
                                                        components={{
                                                            ul: ({ node, ...props }) => <ul className="list-disc ml-4 my-2 space-y-1" {...props} />,
                                                            ol: ({ node, ...props }) => <ol className="list-decimal ml-4 my-2 space-y-1" {...props} />,
                                                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                            h3: ({ node, ...props }) => <h3 className="font-semibold text-foreground mt-4 mb-2 text-sm" {...props} />,
                                                            strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
                                                            p: ({ node, ...props }) => <p className="leading-relaxed my-2 last:mb-0" {...props} />,
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
                                        <Avatar className="w-8 h-8 border border-border">
                                            <AvatarFallback className="bg-muted">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="bg-muted rounded-xl p-3 text-sm text-muted-foreground">
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
                        )}
                    </ScrollArea>

                    {/* Suggested Questions */}
                    {messages.length <= 1 && !isInitializing && (
                        <div className="px-4 pb-3">
                            <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedQuestions.slice(0, 2).map((q, i) => (
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
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                ref={inputRef}
                                placeholder="Ask about their strategy, holdings, or moves..."
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

                {/* Collapsible History Sidebar */}
                {isSidebarOpen && (
                    <div className="w-80 shrink-0 animate-in slide-in-from-right duration-200">
                        <CompactChatHistorySidebar
                            type="fund-intelligence"
                            onSelectSession={loadSession}
                            currentSessionId={currentSessionId || undefined}
                            onClose={() => setIsSidebarOpen(false)}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
