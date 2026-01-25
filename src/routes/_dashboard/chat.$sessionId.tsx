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
import { ReportView } from "@/components/ReportView";
import { useSidebar } from "@/components/ui/sidebar";

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
    const { setOpen } = useSidebar();

    const { data: session } = authClient.useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    // History sidebar on the right
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [contextType, setContextType] = useState<"fund" | "stock" | "fund-intelligence">("fund-intelligence");
    const [contextId, setContextId] = useState<string>("");
    const [contextName, setContextName] = useState<string>("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Collapse main sidebar on mount for more room
    useEffect(() => {
        setOpen(false);
    }, []);

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
                    search: searchParams,
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
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setOpen(true);
                                    // Navigate back based on context
                                    switch (contextType) {
                                        case "stock":
                                            navigate({ to: "/stocks" });
                                            break;
                                        case "fund":
                                            navigate({ to: "/funds" });
                                            break;
                                        case "fund-intelligence":
                                            navigate({ to: "/fund-intelligence" });
                                            break;
                                        default:
                                            navigate({ to: "/dashboard" });
                                    }
                                }}
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
                            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                            className="gap-2"
                        >
                            {isHistoryOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                            {isHistoryOpen ? "Hide" : "Show"} History
                        </Button>
                    </div>
                </div>

                {/* Chat Messages */}
                <ScrollArea className="flex-1 px-4">
                    <div className="max-w-7xl mx-auto py-4">
                        {isInitializing ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-8 pb-12">
                                {/* Report View for the first message (Analysis) */}
                                {messages.length > 0 && messages[0].role === "model" && (
                                    <div className="animate-in fade-in duration-500">
                                        <ReportView content={messages[0].content} />
                                        {messages.length > 1 && <div className="border-t border-border my-8" />}
                                    </div>
                                )}

                                {/* Simple Q&A for follow-up messages */}
                                {messages.length > 0 && (
                                    <div className="max-w-4xl mx-auto space-y-6">
                                        {messages.slice(messages[0].role === "model" ? 1 : 0).map((m, i) => (
                                            <div
                                                key={i}
                                                className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                            >
                                                <Avatar className="w-8 h-8 border border-border shrink-0">
                                                    <AvatarFallback
                                                        className={m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}
                                                    >
                                                        {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className={`rounded-lg px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                                                        }`}
                                                >
                                                    {m.role === "model" ? (
                                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                                            <ReactMarkdown>{m.content}</ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        <p className="whitespace-pre-wrap">{m.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div ref={scrollRef} />
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t border-border bg-card/50 p-4">
                    <div className="max-w-7xl mx-auto">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                ref={inputRef}
                                placeholder="Ask a follow-up question about this analysis..."
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
            {isHistoryOpen && (
                <div className="w-80 shrink-0 animate-in slide-in-from-right duration-200 border-l border-border">
                    <CompactChatHistorySidebar
                        type={contextType}
                        onSelectSession={handleLoadSession}
                        currentSessionId={currentSessionId || undefined}
                        onClose={() => setIsHistoryOpen(false)}
                        showAllTypes={true}
                    />
                </div>
            )}
        </div>
    );
}
