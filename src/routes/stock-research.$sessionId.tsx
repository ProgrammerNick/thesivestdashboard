
import { createFileRoute, useParams, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { StockHistorySidebar } from "@/components/StockHistorySidebar";
import { CleanChatInterface } from "@/components/CleanChatInterface";
import { ResearchChart } from "@/components/ResearchChart";
import { searchStock, StockData } from "@/server/fn/stocks";
import { getSymbolPosts } from "@/server/fn/posts";
import { getOrCreateChatSession, addChatMessage, chatWithStock } from "@/server/fn/stock-chat";
import { getChatSession } from "@/server/fn/chat-history";
import { authClient } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainCircuit, Loader2, Scale, TrendingUp, AlertTriangle, Activity, Calendar, Target, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { z } from "zod";

const stockResearchSearchSchema = z.object({
  symbol: z.string().optional(),
});

export const Route = createFileRoute("/stock-research/$sessionId")({
  component: StockResearchSessionPage,
  validateSearch: stockResearchSearchSchema,
});

function StockResearchSessionPage() {
  const { sessionId } = Route.useParams();
  const search = Route.useSearch();
  const { data: session } = authClient.useSession();

  const [stockData, setStockData] = useState<StockData | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([]);
  const [error, setError] = useState("");

  const effectiveSymbol = search.symbol || stockData?.symbol;

  useEffect(() => {
    loadSession();
  }, [sessionId, search.symbol, session?.user?.id]);

  const loadSession = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError("");

    try {
      // 1. Check if session exists
      let currentSession = null;
      if (!sessionId.startsWith('temp-')) {
        currentSession = await getChatSession({ data: { sessionId } });
      }

      // 2. Identify symbol to load
      let symbolToLoad = search.symbol;

      if (!symbolToLoad && currentSession) {
        symbolToLoad = currentSession.contextId;
      }

      if (!symbolToLoad) {
        // New session without symbol? Wait for user input or handle error
        setIsLoading(false);
        return;
      }

      // 3. Load Stock Data & Posts
      const [data, postsData] = await Promise.all([
        searchStock({ data: symbolToLoad }),
        getSymbolPosts({ data: { symbol: symbolToLoad.toUpperCase() } })
      ]);

      setStockData(data);
      setPosts(postsData);

      // 4. Load messages if existing session
      if (currentSession && currentSession.messages) {
        setMessages(currentSession.messages.map((m: any) => ({
          role: m.role === "model" ? "assistant" : "user",
          content: m.content
        })));
      } else {
        // Init empty or welcome message if new
        setMessages([]);
      }

    } catch (err) {
      console.error("Failed to load research session:", err);
      // setError("Failed to load stock data. Please try again.");
      // Allow partial load if stock data fails but chat needs to happen, or just show error
      setError("Could not load analysis. " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

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
Earnings Quality: ${stockData.earningsQuality}
Capital Allocation: ${stockData.capitalAllocation}
        `.trim();
  };

  const handleSendMessage = async (message: string) => {
    if (!stockData || !session?.user?.id) return "Error: No context or user session";

    // 1. Ensure backend session exists (create if temp)
    let activeSessionId = sessionId;
    if (sessionId.startsWith('temp-')) {
      // Create real session on first message
      try {
        const newSession = await getOrCreateChatSession({
          data: {
            userId: session.user.id,
            type: "stock",
            contextId: stockData.symbol,
            title: `${stockData.symbol} Analysis`
          }
        });
        activeSessionId = newSession.id;
        // Note: ideally we'd replace URL here, but keeping it simple for now
      } catch (e) {
        console.error("Failed to create session", e);
        return "Error creating session";
      }
    }

    try {
      // Save User Message
      if (!activeSessionId.startsWith('temp-')) {
        await addChatMessage({
          data: { sessionId: activeSessionId, role: "user", content: message }
        });
      }

      const response = await chatWithStock({
        data: {
          symbol: stockData.symbol,
          context: buildChatContext(),
          messages: [{ role: "user", content: message }]
        }
      });

      if (!activeSessionId.startsWith('temp-')) {
        await addChatMessage({
          data: { sessionId: activeSessionId, role: "model", content: response }
        });
      }

      return response;

    } catch (err) {
      console.error("Chat error:", err);
      return "I encountered an error analyzing that query. Please try again.";
    }
  };

  return (
    <SidebarProvider>
      <StockHistorySidebar />
      <SidebarInset>
        <div className="flex h-screen flex-col bg-background">
          {/* Header */}
          <header className="flex items-center h-14 border-b px-6 gap-4">
            {stockData ? (
              <>
                <Badge variant="outline" className="font-mono text-base">{stockData.symbol}</Badge>
                <h1 className="font-semibold truncate">{stockData.companyName}</h1>
                <div className="ml-auto flex items-center text-xs text-muted-foreground">
                  <BrainCircuit className="w-3 h-3 mr-1 text-primary" />
                  AI Analysis Active
                </div>
              </>
            ) : (
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            )}
          </header>

          <div className="flex-1 overflow-hidden grid lg:grid-cols-2">
            {/* Left Panel: Analysis & Charts */}
            <div className="overflow-y-auto p-6 scroll-smooth border-r">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="p-4 text-destructive bg-destructive/10 rounded-lg">
                  {error}
                </div>
              ) : stockData ? (
                <div className="space-y-8 pb-12">
                  {/* Research Chart */}
                  <ResearchChart symbol={stockData.symbol} posts={posts} />

                  {/* Analysis Cards - Reusing layout from StockSearch */}
                  <div className="space-y-6">
                    {/* Moat Analysis */}
                    <Card className="p-6 bg-card border-border/60">
                      <div className="flex items-center gap-2 mb-4 text-blue-500">
                        <Scale className="w-5 h-5" />
                        <h4 className="font-bold uppercase tracking-wider text-sm">Economic Moat</h4>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{stockData.moatAnalysis}</p>
                    </Card>

                    {/* Growth Catalysts */}
                    <Card className="p-6 bg-card border-border/60">
                      <div className="flex items-center gap-2 mb-4 text-green-500">
                        <TrendingUp className="w-5 h-5" />
                        <h4 className="font-bold uppercase tracking-wider text-sm">Growth Catalysts</h4>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{stockData.growthCatalysts}</p>
                    </Card>

                    {/* Key Risks */}
                    <Card className="p-6 bg-card border-border/60">
                      <div className="flex items-center gap-2 mb-4 text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                        <h4 className="font-bold uppercase tracking-wider text-sm">Key Risks</h4>
                      </div>
                      <ul className="space-y-2">
                        {Array.isArray(stockData.keyRisks) ? stockData.keyRisks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground leading-relaxed">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{risk}</span>
                          </li>
                        )) : <li className="text-muted-foreground">{stockData.keyRisks}</li>}
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
                          <p className="text-muted-foreground text-sm">{stockData.financialHealth}</p>
                        </div>
                        <div className="pt-4 border-t border-border/40">
                          <span className="text-xs font-semibold text-foreground uppercase block mb-1">Valuation Context</span>
                          <p className="text-muted-foreground text-sm">{stockData.valuationCommentary}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                  <p>Detailed analysis will appear here.</p>
                </div>
              )}
            </div>

            {/* Right Panel: Chat Interface */}
            <div className="bg-muted/10 h-full flex flex-col">
              <CleanChatInterface
                initialMessage={stockData ? `I've analyzed ${stockData.companyName}. Ask me anything about their valuation, risks, or competitive advantage.` : "Loading analysis..."}
                onSendMessage={handleSendMessage}
                previousMessages={messages}
                sessionKey={sessionId} // Forces re-render on session switch
                placeholder={stockData ? `Ask about ${stockData.symbol}...` : "Type a message..."}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
