import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { chatWithFund } from "@/server/fn/chat";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { FundData } from "@/server/fn/funds";
import { getOrCreateChatSession, addChatMessage, getChatSession } from "@/server/fn/chat-history";
import { authClient } from "@/lib/auth-client";
import { SavedChats } from "./SavedChats";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "model";
    content: string;
}

interface FundChatProps {
    fundData: FundData;
    fundName: string;
}

export function FundChat({ fundData, fundName }: FundChatProps) {
    const { data: session } = authClient.useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize or load existing session when fundName changes
    useEffect(() => {
        if (fundName && session?.user?.id) {
            initializeSession();
        } else if (fundName && !session?.user?.id) {
            // If no user, show initial greeting without persistence
            setMessages([
                {
                    role: "model",
                    content: `Hi! I've analyzed ${fundName}'s latest activity. Ask me anything about their strategy, recent moves, or specific holdings.`
                }
            ]);
            setCurrentSessionId(null);
        }
    }, [fundName, session?.user?.id]);

    const initializeSession = async (): Promise<string | null> => {
        if (!fundName || !session?.user?.id) return null;
        
        setIsInitializing(true);
        try {
            const sessionData = await getOrCreateChatSession({
                data: {
                    userId: session.user.id,
                    type: "fund",
                    contextId: fundName,
                    title: `${fundName} Analysis`,
                },
            });

            setCurrentSessionId(sessionData.id);

            if (sessionData.messages && sessionData.messages.length > 0) {
                // Load existing messages
                setMessages(
                    sessionData.messages.map((m: any) => ({
                        role: m.role as "user" | "model",
                        content: m.content,
                    }))
                );
            } else {
                // New session - add initial greeting
                const greeting: Message = {
                    role: "model",
                    content: `Hi! I've analyzed ${fundName}'s latest activity. Ask me anything about their strategy, recent moves, or specific holdings.`
                };
                setMessages([greeting]);

                // Save the greeting message
                await addChatMessage({
                    data: {
                        sessionId: sessionData.id,
                        role: "model",
                        content: greeting.content,
                    },
                });
            }
            return sessionData.id;
        } catch (error) {
            console.error("Failed to initialize session:", error);
            // Fallback to non-persisted greeting
            setMessages([
                {
                    role: "model",
                    content: `Hi! I've analyzed ${fundName}'s latest activity. Ask me anything about their strategy, recent moves, or specific holdings.`
                }
            ]);
            return null;
        } finally {
            setIsInitializing(false);
        }
    };

    // Load a specific session from saved chats
    const handleLoadSession = async (sessionId: string) => {
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
            }
        } catch (error) {
            console.error("Failed to load session:", error);
        }
    };

    // Refresh handler for SavedChats
    const handleRefresh = () => {
        if (fundName && session?.user?.id) {
            initializeSession();
        }
    };

    // Clear chat history
    const handleClearHistory = () => {
        setMessages([
            {
                role: "model",
                content: `Hi! I've analyzed ${fundName}'s latest activity. Ask me anything about their strategy, recent moves, or specific holdings.`
            }
        ]);
        setCurrentSessionId(null);
        if (fundName && session?.user?.id) {
            // Reinitialize to create a new session
            initializeSession();
        }
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

        // Ensure we have a session
        let sessionId = currentSessionId;
        if (!sessionId && session?.user?.id) {
            sessionId = await initializeSession();
            if (!sessionId) {
                console.error("Failed to create session");
                return;
            }
        }

        if (!sessionId) {
            console.error("No session available");
            return;
        }

        const userMessage = { role: "user" as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Save user message to database
        addChatMessage({
            data: {
                sessionId: sessionId,
                role: "user",
                content: userMessage.content,
            },
        }).catch(console.error);

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

            const aiMessage: Message = { role: "model", content: response };
            setMessages(prev => [...prev, aiMessage]);

            // Save AI response to database
            addChatMessage({
                data: {
                    sessionId: sessionId,
                    role: "model",
                    content: aiMessage.content,
                },
            }).catch(console.error);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "model", content: "Sorry, I encountered an error answering that. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
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
                                        {m.role === "model" ? (
                                            <div className="[&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>strong]:font-semibold [&>strong]:text-foreground [&>em]:italic [&>ul]:my-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:my-2 [&>ol]:list-decimal [&>ol]:ml-4 [&>li]:my-1 [&>h1]:text-lg [&>h1]:font-bold [&>h1]:my-2 [&>h2]:text-base [&>h2]:font-bold [&>h2]:my-2 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:my-2 [&>code]:bg-muted-foreground/20 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-xs [&>pre]:bg-muted-foreground/10 [&>pre]:p-2 [&>pre]:rounded [&>pre]:overflow-x-auto [&>pre>code]:bg-transparent [&>blockquote]:border-l-4 [&>blockquote]:border-muted-foreground/30 [&>blockquote]:pl-4 [&>blockquote]:italic">
                                                <ReactMarkdown>{m.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{m.content}</p>
                                        )}
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
                    )}
                </ScrollArea>

                <div className="p-4 border-t border-border/50 bg-background/40">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            placeholder="Ask about specific holdings..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading || isInitializing}
                            className="flex-1 bg-background/50"
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim() || isInitializing}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
        {fundName && session?.user?.id && (
            <SavedChats
                type="fund"
                contextId={fundName}
                onLoadSession={handleLoadSession}
                currentSessionId={currentSessionId || undefined}
                onRefresh={handleRefresh}
            />
        )}
    </>
    );
}
