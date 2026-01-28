import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { searchStock } from "@/server/fn/stocks";
import { authClient } from "@/lib/auth-client";
import { getOrCreateChatSession, addChatMessage } from "@/server/fn/chat-history";
import { CompactChatHistorySidebar } from "./CompactChatHistorySidebar";

export function StockSearch() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { data: session } = authClient.useSession();
    const navigate = useNavigate();


    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError("");

        try {
            const data = await searchStock({ data: query.toUpperCase() });
            setQuery("");

            // Initialize chat session if user is logged in
            if (session?.user?.id) {
                try {
                    const chatSession = await getOrCreateChatSession({
                        data: {
                            userId: session.user.id,
                            type: "stock",
                            contextId: data.symbol,
                            title: `${data.symbol} AI-Powered Analysis`,
                        }
                    });

                    // Check if we got a temporary session (meaning user doesn't exist in DB)
                    // @ts-ignore - isTemporary might not be in the shared type definition yet
                    if (chatSession.isTemporary) {
                        console.error("User not found in database - got temporary session. Auth ID:", session.user.id);
                        setError("Account synchronization issue. Please sign out and sign in again.");
                        setIsLoading(false);
                        return;
                    }

                    // If it's a new session or has no messages (failed previous run), save the analysis
                    if (chatSession.isNew || chatSession.messages.length === 0) {
                        const starterSummary = `## ${data.companyName} (${data.symbol}) AI-Powered Analysis

> **Business Summary**
> ${data.businessSummary}

### 🛡️ Competitive Moat
**${data.moatAnalysis}**

### 📊 Valuation & Comparables
${data.valuationCommentary}

| Ticker | Name | P/E | EV/EBITDA | Premium/Discount |
| :--- | :--- | :--- | :--- | :--- |
${data.comparableMultiples?.map(c => `| **${c.ticker}** | ${c.name} | ${c.peRatio} | ${c.evEbitda} | ${c.premium} |`).join('\n')}

### 🏗️ Capital & Management

- **Strategy**: ${data.capitalAllocation}

- **Financial Health**: ${data.financialHealth}

- **Earnings Quality**: ${data.earningsQuality}

### ⚠️ Key Risks
${Array.isArray(data.keyRisks) ? data.keyRisks.map(r => `> - ⚠️ **${r}**`).join('\n') : `> ${data.keyRisks}`}

### 📅 Upcoming Catalysts
| Date | Event | Impact |
| :--- | :--- | :--- |
${data.upcomingCatalysts?.map(c => `| ${c.date} | ${c.event} | ${c.impact} |`).join('\n')}

---
**Growth Catalysts**: ${data.growthCatalysts}
${data.shortInterest ? `\n\n**Short Interest**: ${data.shortInterest}` : ''}

I'm ready to discuss ${data.companyName} in depth. What specific aspect interests you?`;

                        await addChatMessage({
                            data: {
                                sessionId: chatSession.id,
                                role: "model",
                                content: starterSummary
                            }
                        });
                    }

                    // Navigate to dedicated research page
                    navigate({ to: `/chat/${chatSession.id}` });

                } catch (sessionErr) {
                    console.error("Failed to initialize chat session", sessionErr);
                    setError("Failed to initialize session. Please try again.");
                }
            } else {
                setError("Please sign in to access research tools.");
            }
        } catch (err) {
            console.error("Stock search failed", err);
            setError("Failed to analyze stock. Please make sure the ticker is correct.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadSession = (id: string) => {
        navigate({ to: `/chat/${id}` });
    };

    return (
        <section className="py-12 container mx-auto px-6 overflow-hidden transition-all duration-300">
            <div className="max-w-7xl mx-auto space-y-12 transition-all duration-300">


                {/* Search Bar */}
                <Card className="p-2 flex flex-row items-center gap-2 border-primary/20 bg-background/50 backdrop-blur-sm shadow-xl max-w-2xl mx-auto">
                    <Search className="w-5 h-5 text-muted-foreground ml-3" />
                    <Input
                        placeholder="Search ticker e.g. 'AAPL', 'MSFT', 'NVDA'..."
                        className="border-none shadow-none focus-visible:ring-0 text-lg py-6 bg-transparent flex-1"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button
                        size="lg"
                        onClick={handleSearch}
                        className="rounded-lg px-8 font-semibold"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze"}
                    </Button>
                </Card>

                {/* Permanent History List */}
                {session?.user?.id && (
                    <div className="max-w-4xl mx-auto mt-12 bg-card/50 border border-border/50 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-border/50 bg-muted/20">
                            <h3 className="font-semibold flex items-center gap-2">
                                History
                            </h3>
                        </div>
                        <div className="h-[400px] flex flex-col">
                            {/* This sidebar component already includes the Search Bar at the top because we refactored it */}
                            <CompactChatHistorySidebar
                                type="stock"
                                onSelectSession={handleLoadSession}
                                showAllTypes={false}
                                hideHeader={false}
                            // We need to modify CompactChatHistorySidebar to handle "embedded" mode better, 
                            // e.g. hiding the header if we provide one, or just re-using it.
                            // For now let's just let it render.
                            />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="max-w-xl mx-auto text-center text-red-500 bg-red-500/10 p-4 rounded-lg">
                        {error}
                    </div>
                )}
            </div>
        </section>
    );
}
