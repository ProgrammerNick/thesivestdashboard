import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, ArrowLeft, PanelRightClose, PanelRightOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { chatWithFund } from "@/server/fn/chat";
import { getOrCreateChatSession, addChatMessage, getChatSession, generateChatSummary } from "@/server/fn/chat-history";
import { CompactChatHistorySidebar } from "@/components/CompactChatHistorySidebar";
import { authClient } from "@/lib/auth-client";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "model";
    content: string;
}

export const Route = createFileRoute("/_dashboard/chat/$sessionId")({
    component: ChatPage,
});

function ChatPage() {
    const { sessionId } = Route.useParams();
    const navigate = useNavigate();
    const searchParams = Route.useSearch() as { type?: string; id?: string; name?: string };

    const { data: session } = authClient.useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [contextType, setContextType] = useState<"fund" | "stock" | "fund-intelligence">("fund-intelligence");
    const [contextId, setContextId] = useState<string>("");
    const [contextName, setContextName] = useState<string>("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize session
    useEffect(() => {
        initializeChat();
    }, [sessionId, searchParams]);

    const initializeChat = async () => {
        setIsInitializing(true);

        // Handle new chat creation
        if (sessionId === "new" && searchParams.type && searchParams.id) {
            if (!session?.user?.id) {
                // For demo without auth
                setContextType(searchParams.type as any);
                setContextId(searchParams.id);
                setContextName(searchParams.name || searchParams.id);
                setMessages([{
                    role: "model",
                    content: `I'm ready to analyze ${searchParams.name || searchParams.id}. What would you like to know?`
                }]);
                setIsInitializing(false);
                return;
            }

            try {
                // Create new session
                const result = await getOrCreateChatSession({
                    data: {
                        userId: session.user.id,
                        type: searchParams.type as any,
                        contextId: searchParams.id,
                        title: `${searchParams.name} Analysis`,
                    },
                });

                // Redirect to the new session ID
                navigate({
                    to: "/chat/$sessionId",
                    params: { sessionId: result.id },
                    replace: true,
                });
            } catch (error) {
                console.error("Failed to create session:", error);
                setIsInitializing(false);
            }
            return;
        }

        // Load existing session
        if (sessionId && sessionId !== "new") {
            try {
                const sessionData = await getChatSession({ data: { sessionId } });
                if (sessionData) {
                    setCurrentSessionId(sessionData.id);
                    setContextType(sessionData.type as any);
                    setContextId(sessionData.contextId);
                    setContextName(sessionData.title);
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
        }

        setIsInitializing(false);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Focus input
    useEffect(() => {
        if (!isInitializing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isInitializing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

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

        // Build context (simplified for now)
        const context = `Analyzing ${contextName} (${contextId})`;

        try {
            const response = await chatWithFund({
                data: {
                    fundName: contextName,
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

                // Generate summary after first exchange
                if (messages.length <= 1) {
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

    const handleLoadSession = (sessionId: string) => {
        navigate({
            to: "/chat/$sessionId",
            params: { sessionId },
        });
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-background">
            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <div className="border-b border-border bg-card/50 px-4 py-3">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">{/* Changed from max-w-5xl to max-w-7xl */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate({ to: "/fund-intelligence" })}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">AI Research Chat</h3>
                                {contextName && (
                                    <p className="text-xs text-muted-foreground">Analyzing {contextName}</p>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="gap-2"
                        >
                            {isSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                            {isSidebarOpen ? "Hide" : "Show"} History
                        </Button>
                    </div>
                </div>

                {/* Chat Messages */}
                <ScrollArea className="flex-1 px-4">
                    <div className="max-w-7xl mx-auto py-4">{/* Changed from max-w-3xl to max-w-7xl */}
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
                                            className={`rounded-xl p-3 max-w-[85%] text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                                }`}
                                        >
                                            {m.role === "model" ? (
                                                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
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
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t border-border bg-card/50 p-4">
                    <div className="max-w-7xl mx-auto">{/* Changed from max-w-3xl to max-w-7xl */}
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                ref={inputRef}
                                placeholder="Ask anything about this research..."
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

            {/* Chat History Sidebar */}
            {isSidebarOpen && (
                <div className="w-80 shrink-0 animate-in slide-in-from-right duration-200 border-l border-border">
                    <CompactChatHistorySidebar
                        type={contextType}
                        onSelectSession={handleLoadSession}
                        currentSessionId={currentSessionId || undefined}
                        onClose={() => setIsSidebarOpen(false)}
                        showAllTypes={true}
                    />
                </div>
            )}
        </div>
    );
}
