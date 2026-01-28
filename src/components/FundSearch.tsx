import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useNavigate } from "@tanstack/react-router";
import { searchFund } from "../server/fn/funds";
import { getOrCreateChatSession, addChatMessage } from "@/server/fn/chat-history";
import { authClient } from "@/lib/auth-client";
import { CompactChatHistorySidebar } from "./CompactChatHistorySidebar";

interface Holding {
    symbol: string;
    name: string;
    percent: number;
}



export function FundSearch() {
    const { data: session } = authClient.useSession();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError("");

        try {
            const data = await searchFund({
                data: query
            });

            // Initialize chat session if user is logged in
            if (session?.user?.id) {
                try {
                    const chatSession = await getOrCreateChatSession({
                        data: {
                            userId: session.user.id,
                            type: "fund",
                            contextId: query,
                            title: `${data.fundName} Analysis`,
                        },
                    });

                    // If it's a new session or has no messages, save the analysis
                    if (chatSession.isNew || chatSession.messages.length === 0) {
                        const starterSummary = `## ${data.fundName} Investment Strategy Analysis

> **Strategy Overview**
> ${data.strategy}

### 🎯 Conviction Thesis
${data.convictionThesis.replace(/^"|"$/g, '')}

### 📊 Portfolio Composition

- **Ownership Concentration**: ${data.ownershipConcentration}

- **Position Sizing**: ${data.positionSizingLogic}

- **Cash Position**: ${data.cashPosition}

### 🏦 Top Holdings
| Symbol | Name | Weight |
| :--- | :--- | :--- |
${data.holdings.map(h => `| ${h.symbol} | ${h.name} | ${h.percent}% |`).join('\n')}

### 📈 Performance & Activity
- **Recent Activity**: ${data.recentActivity}
- **Outlook**: ${data.performanceOutlook}

---
I have analyzed the fund's latest filings and strategy. What specific aspect would you like to discuss?`;

                        await addChatMessage({
                            data: {
                                sessionId: chatSession.id,
                                role: "model",
                                content: starterSummary
                            }
                        });
                    }

                    navigate({ to: `/chat/${chatSession.id}` });
                } catch (sessionErr) {
                    console.error("Failed to initialize session", sessionErr);
                    setError("Failed to create analysis session.");
                }
            } else {
                setError("Please sign in to access fund research.");
            }
        } catch (err) {
            console.error(err);
            setError("Could not fetch fund data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadSession = (id: string) => {
        navigate({ to: `/chat/${id}` });
    };

    return (
        <section className="py-20 container mx-auto px-6">
            <div className="max-w-7xl mx-auto space-y-12">


                {/* Search Bar */}
                <Card className="p-2 flex flex-row items-center gap-2 border-primary/20 bg-background/50 backdrop-blur-sm shadow-xl max-w-2xl mx-auto">
                    <Search className="w-5 h-5 text-muted-foreground ml-3" />
                    <Input
                        placeholder="Search e.g. 'Ark Innovation', 'Berkshire', 'Bridgewater'..."
                        className="border-none shadow-none focus-visible:ring-0 text-lg py-6 bg-transparent"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button
                        size="lg"
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="rounded-lg px-8 font-semibold"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze"}
                    </Button>
                </Card>

                {/* Error State */}
                {error && (
                    <div className="max-w-xl mx-auto text-center text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )}

                {/* History Section */}
                {session?.user?.id && (
                    <div className="max-w-4xl mx-auto mt-12 bg-card/50 border border-border/50 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-border/50 bg-muted/20">
                            <h3 className="font-semibold flex items-center gap-2">
                                History
                            </h3>
                        </div>
                        <div className="h-[400px] flex flex-col">
                            <CompactChatHistorySidebar
                                type="fund"
                                onSelectSession={handleLoadSession}
                                showAllTypes={false}
                                hideHeader={false}
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
