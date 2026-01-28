import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { discoverStocksFn, type StockDiscoveryResult } from "@/server/fn/discovery";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowRight, TrendingUp, AlertTriangle, Zap, Target, BarChart3, Globe, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { CompactChatHistorySidebar } from "@/components/CompactChatHistorySidebar";

export const Route = createFileRoute("/_dashboard/discovery")({
    component: DiscoveryPage,
});

const INVESTMENT_STYLES = [
    { id: "Thematic", label: "Thematic", icon: Globe, desc: "Macro trends & structural shifts" },
    { id: "Fundamentals", label: "Fundamental", icon: BarChart3, desc: "Strong balance sheet & cash flows" },
    { id: "Contrarian", label: "Contrarian", icon: Zap, desc: "Beaten down & turnaround plays" },
    { id: "Special Situation", label: "Special Situation", icon: Target, desc: "Spinoffs, arbitrages & events" },
    { id: "Compounders", label: "Compounders", icon: ShieldCheck, desc: "Consistent high-quality growth" },
];

const SECTORS = [
    "Technology", "Healthcare", "Financials", "Energy", "Consumer Discretionary",
    "Consumer Staples", "Industrials", "Materials", "Real Estate", "Utilities", "Communication Services"
];

const MARKET_CAPS = ["Mega Cap ($200B+)", "Large Cap ($10B - $200B)", "Mid Cap ($2B - $10B)", "Small Cap (<$2B)"];

function DiscoveryPage() {
    const { data: session } = authClient.useSession();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [style, setStyle] = useState("Thematic");
    const [sector, setSector] = useState("Any");
    const [marketCap, setMarketCap] = useState("Any");

    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<StockDiscoveryResult[] | null>(null);
    const [error, setError] = useState("");

    const handleLoadSession = (id: string) => {
        navigate({ to: `/chat/${id}` });
    };

    const handleSearch = async () => {
        // Validation: Need at least context OR a style selection
        if (!query.trim() && !style && (!sector || sector === "Any")) return;

        setIsLoading(true);
        setError("");
        setResults(null);

        try {
            const data = await discoverStocksFn({
                data: {
                    query,
                    style,
                    sector: sector === "Any" ? undefined : sector,
                    marketCap: marketCap === "Any" ? undefined : marketCap
                }
            });
            setResults(data);
        } catch (err) {
            setError("Failed to generate ideas. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-12">

            {/* Header */}
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-4xl font-heading font-bold tracking-tight">
                    Idea Lab
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Define your criteria. Let AI scout the market for high-conviction opportunities.
                </p>
            </div>

            {/* Structured Input Panel */}
            <Card className="border-border/50 shadow-xl bg-card/60 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 opacity-70" />
                <CardContent className="p-8 space-y-8">

                    {/* 1. Investment Style Selection */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            1. Choose Investment Approach
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {INVESTMENT_STYLES.map((s) => {
                                const Icon = s.icon;
                                const isSelected = style === s.id;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setStyle(s.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 gap-2 h-full text-center hover:border-primary/50 relative overflow-hidden group",
                                            isSelected
                                                ? "bg-primary/5 border-primary ring-1 ring-primary/20 text-foreground"
                                                : "bg-background border-border text-muted-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        <Icon className={cn("w-6 h-6 mb-1", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                        <span className="text-sm font-semibold">{s.label}</span>
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* 2. Filters */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">2. Target Universe</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Sector</Label>
                                    <Select value={sector} onValueChange={setSector}>
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Any Sector" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Any">Any Sector</SelectItem>
                                            {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Market Cap</Label>
                                    <Select value={marketCap} onValueChange={setMarketCap}>
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Any Size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Any">Any Size</SelectItem>
                                            {MARKET_CAPS.map(MC => <SelectItem key={MC} value={MC}>{MC}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* 3. Context */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">3. Additional Context (Optional)</Label>
                            <Textarea
                                placeholder="e.g. 'Looking for companies with high insider ownership' or 'Avoid cyclical industries'"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="resize-none min-h-[100px] bg-background text-base"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button
                            onClick={handleSearch}
                            disabled={isLoading}
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-8 py-6 text-lg rounded-xl w-full md:w-auto"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Scouting Market...
                                </>
                            ) : (
                                <>
                                    Generate Ideas
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>

                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <div className="bg-destructive/10 text-destructive text-center p-4 rounded-lg border border-destructive/20 max-w-2xl mx-auto">
                    {error}
                </div>
            )}

            {/* Results Section */}
            {results && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between border-b border-border/50 pb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Scouted Opportunities
                        </h2>
                        <Badge variant="secondary" className="px-3 py-1">
                            {results.length} Matches Found
                        </Badge>
                    </div>

                    <div className="grid gap-6">
                        {results.map((stock, idx) => (
                            <Card key={idx} className="group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md bg-card/40 backdrop-blur-sm">
                                <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <Badge className="text-lg font-bold px-3 py-1 radius-md bg-primary text-primary-foreground">
                                                    {stock.symbol}
                                                </Badge>
                                                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                                    {stock.name}
                                                </CardTitle>
                                            </div>
                                        </div>
                                        <Button size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link to="/stocks" search={{ query: stock.symbol }}>
                                                Analyze
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">

                                    {/* Thematic Fit */}
                                    <div>
                                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Target className="w-4 h-4" /> Thesis Fit
                                        </h4>
                                        <p className="text-base font-medium leading-relaxed">
                                            {stock.thematicFit}
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/10">
                                            <h4 className="text-sm font-bold text-blue-500 mb-2 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4" />
                                                Variant View
                                            </h4>
                                            <p className="text-sm text-foreground/80 leading-relaxed">
                                                {stock.marketView}
                                            </p>
                                        </div>

                                        <div className="bg-orange-500/5 p-4 rounded-lg border border-orange-500/10">
                                            <h4 className="text-sm font-bold text-orange-500 mb-2 flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" />
                                                Upcoming Catalysts
                                            </h4>
                                            <ul className="text-sm text-foreground/80 space-y-2">
                                                {stock.catalysts.map((cat, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                                        <span>{cat}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Permanent History List */}
            {session?.user?.id && (
                <div className="max-w-4xl mx-auto mt-12 bg-card/50 border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                    <div className="p-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2">
                            Your Idea Lab History
                        </h3>
                    </div>
                    <div className="h-[300px] flex flex-col">
                        <CompactChatHistorySidebar
                            type="discovery"
                            onSelectSession={handleLoadSession}
                            showAllTypes={false}
                            hideHeader={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
