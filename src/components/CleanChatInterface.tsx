import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface CleanChatInterfaceProps {
    onSendMessage: (message: string) => Promise<string>;
    initialMessage?: string;
    placeholder?: string;
    /** Previous messages to load from a session */
    previousMessages?: Message[];
    /** Key to force re-render when session changes */
    sessionKey?: string;
}

export function CleanChatInterface({
    onSendMessage,
    initialMessage,
    placeholder = "Ask anything...",
    previousMessages,
    sessionKey,
}: CleanChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasInitialized = useRef(false);

    // Initialize messages from previous session or initial message
    useEffect(() => {
        // Reset when sessionKey changes
        hasInitialized.current = false;
    }, [sessionKey]);

    useEffect(() => {
        if (hasInitialized.current) return;

        if (previousMessages && previousMessages.length > 0) {
            // Load previous messages from session
            setMessages(previousMessages);
            hasInitialized.current = true;
        } else if (initialMessage) {
            // Start fresh with initial greeting
            setMessages([{ role: "assistant", content: initialMessage }]);
            hasInitialized.current = true;
        }
    }, [previousMessages, initialMessage, sessionKey]);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    };

    useEffect(() => {
        // specific timeout to ensure DOM update
        const timeoutId = setTimeout(scrollToBottom, 50);
        return () => clearTimeout(timeoutId);
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Immediate scroll on user message
        setTimeout(scrollToBottom, 0);

        try {
            const response = await onSendMessage(input);
            const aiMessage: Message = { role: "assistant", content: response };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "I encountered an error. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 && !initialMessage && (
                        <div className="text-center py-12 text-gray-400">
                            <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-sm">Start a conversation about this research</p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {m.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] ${m.role === "user"
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tr-none"
                                    : "text-gray-900 dark:text-gray-100"
                                    } ${m.role === "user" ? "px-4 py-3" : ""}`}
                            >
                                {m.role === "assistant" ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:text-gray-900 dark:prose-pre:text-gray-100">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-sm leading-relaxed">{m.content}</p>
                                )}
                            </div>

                            {m.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center shrink-0 mt-1">
                                    <User className="w-4 h-4 text-white dark:text-gray-900" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                <Loader2 className="w-4 h-4 text-gray-600 dark:text-gray-400 animate-spin" />
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
                    <Input
                        ref={inputRef}
                        placeholder={placeholder}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600"
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
