import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { searchStock, StockData } from "@/server/fn/stocks";
import { chatWithStock } from "@/server/fn/stock-chat";
import { getChatSession, addChatMessage } from "@/server/fn/chat-history";
import { authClient } from "@/lib/auth-client";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "model";
  content: string;
}

export const Route = createFileRoute("/_research/stock-research/$sessionId")({
  component: StockResearchPage,
});

function StockResearchPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const searchParams = Route.useSearch() as { symbol?: string };

  const { data: session } = authClient.useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [symbol, setSymbol] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session
  useEffect(() => {
    initializeResearch();
  }, [sessionId, searchParams.symbol]);

  const initializeResearch = async () => {
    setIsInitializing(true);

    // If we have a symbol in search params, this is a new research
    if (searchParams.symbol) {
      try {
        const data = await searchStock({ data: searchParams.symbol });
        setStockData(data);
        setSymbol(data.symbol);
        setMessages([{
          role: "model",
          content: `I've analyzed **${data.companyName} (${data.symbol})**. Here's what I found:\n\n**Business:** ${data.businessSummary}\n\n**Economic Moat:** ${data.moatAnalysis}\n\n**Growth Catalysts:** ${data.growthCatalysts}\n\nWhat would you like to know more about?`
        }]);
      } catch (error) {
        console.error("Failed to load stock data:", error);
        setMessages([{
          role: "model",
          content: "I encountered an error loading the stock data. Please try again."
        }]);
      }
      setIsInitializing(false);
      return;
    }

    // Load existing session
    if (sessionId && !sessionId.startsWith("temp-")) {
      try {
        const sessionData = await getChatSession({ data: { sessionId } });
        if (sessionData) {
          setSymbol(sessionData.contextId);

          // Load stock data
          const data = await searchStock({ data: sessionData.contextId });
          setStockData(data);

          // Load messages
          if (sessionData.messages && sessionData.messages.length > 0) {
            setMessages(
              sessionData.messages.map((m: any) => ({
                role: m.role as "user" | "model",
                content: m.content,
              }))
            );
          } else {
            setMessages([{
              role: "model",
              content: `Continuing our analysis of ${data.companyName} (${data.symbol}). What would you like to know?`
            }]);
          }
        }
      } catch (error) {
        console.error("Failed to load session:", error);
      }
    } else if (sessionId && sessionId.startsWith("temp-")) {
      // Temp session - just show a welcome message
      setMessages([{
        role: "model",
        content: "Welcome to Stock Research. Use the search on the Stocks page to analyze a company."
      }]);
    }

    setIsInitializing(false);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Build context for chat
  const buildChatContext = () => {
    if (!stockData) return "";
    return `
Symbol: ${stockData.symbol}
Company: ${stockData.companyName}
Business: ${stockData.businessSummary}
Moat: ${stockData.moatAnalysis}
Growth Catalysts: ${stockData.growthCatalysts}
Key Risks: ${Array.isArray(stockData.keyRisks) ? stockData.keyRisks.join(", ") : stockData.keyRisks}
Financial Health: ${stockData.financialHealth}
Valuation: ${stockData.valuationCommentary}
        `.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Save user message to database (if possible)
      if (sessionId && !sessionId.startsWith("temp-")) {
        try {
          await addChatMessage({
            data: { sessionId, role: "user", content: input },
          });
        } catch (e) {
          console.warn("Could not save message to database:", e);
        }
      }

      // Get AI response - this works independently of database
      const response = await chatWithStock({
        data: {
          symbol: symbol || "UNKNOWN",
          context: buildChatContext(),
          messages: [...messages, userMessage].map(m => ({
            role: m.role === "model" ? "model" : "user",
            content: m.content
          })),
        }
      });

      const aiMessage: Message = { role: "model", content: response };
      setMessages((prev) => [...prev, aiMessage]);

      // Save AI response to database (if possible)
      if (sessionId && !sessionId.startsWith("temp-")) {
        try {
          await addChatMessage({
            data: { sessionId, role: "model", content: response },
          });
        } catch (e) {
          console.warn("Could not save AI response to database:", e);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "I encountered an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">
              {stockData ? `${stockData.symbol} - ${stockData.companyName}` : "Stock Research"}
            </h1>
            <p className="text-sm text-muted-foreground">AI-powered equity analysis</p>
          </div>
          {stockData && (
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Analysis
            </Badge>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-6">
        <div className="max-w-4xl mx-auto py-6 space-y-6">
          {isInitializing ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "model" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] ${m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none px-4 py-3"
                      : "text-foreground"
                    }`}
                >
                  {m.role === "model" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{m.content}</p>
                  )}
                </div>

                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
          <Input
            ref={inputRef}
            placeholder={stockData ? `Ask about ${stockData.symbol}...` : "Ask anything about this stock..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
