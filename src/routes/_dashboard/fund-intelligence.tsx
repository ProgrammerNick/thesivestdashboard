import { createFileRoute } from "@tanstack/react-router";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowUpRight,
    ArrowDownRight,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useState } from "react";
import { FundSearchPanel } from "@/components/FundSearchPanel";
import { FundDetailPanel } from "@/components/FundDetailPanel";
import { FundChatSlidePanel } from "@/components/FundChatSlidePanel";
import { InstitutionalFund, institutionalFunds } from "@/server/data/fund-data";

export const Route = createFileRoute("/_dashboard/fund-intelligence")({
    component: FundsDashboard,
});

function FundsDashboard() {
    const [selectedPeriod] = useState("Q3 2025");
    const [selectedFund, setSelectedFund] = useState<InstitutionalFund | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showSearchPanel, setShowSearchPanel] = useState(true);

    // Get aggregated data from all funds
    const aggregatedMoves = institutionalFunds
        .flatMap(f => f.recentMoves.map(m => ({ ...m, fund: f.name })))
        .slice(0, 6);

    return (
        <div className="space-y-6 max-w-full">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
                        Fund Intelligence
                        <Badge variant="outline" className="text-xs font-normal ml-2">PRO</Badge>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Institutional money flow analysis. Search funds, analyze positions, and chat with AI.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        Filter
                    </Button>
                    <Button variant="outline" size="sm">
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Smart Money Sentiment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            Bullish
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tech & Industrials leading accumulation.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Top Consensus Buy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">NVDA</div>
                        <p className="text-xs text-muted-foreground mt-1 text-green-500">
                            +12 Funds added in {selectedPeriod}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Top Consensus Sell</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">TSLA</div>
                        <p className="text-xs text-muted-foreground mt-1 text-red-500">
                            -8 Funds trimmed exposure
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Sector Rotation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            Tech <ArrowDownRight className="w-4 h-4 text-muted-foreground" /> Energy
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Defensive pivot detected vs last Q.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Fund Search Section (Collapsible) */}
            <Card className="border-primary/20">
                <CardHeader
                    className="cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => setShowSearchPanel(!showSearchPanel)}
                >
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Search Institutional Funds</CardTitle>
                        <Button variant="ghost" size="sm" className="gap-1">
                            {showSearchPanel ? (
                                <>Hide <ChevronUp className="w-4 h-4" /></>
                            ) : (
                                <>Show <ChevronDown className="w-4 h-4" /></>
                            )}
                        </Button>
                    </div>
                    <CardDescription>
                        Click on a fund to view their portfolio and ask AI questions
                    </CardDescription>
                </CardHeader>
                {showSearchPanel && (
                    <CardContent className="pt-0">
                        <FundSearchPanel
                            onSelectFund={(fund) => {
                                setSelectedFund(fund);
                                setShowSearchPanel(false);
                            }}
                            selectedFundId={selectedFund?.id}
                        />
                    </CardContent>
                )}
            </Card>

            {/* Selected Fund Detail */}
            {selectedFund && (
                <FundDetailPanel
                    fund={selectedFund}
                    onAskAI={() => setIsChatOpen(true)}
                    onClose={() => setSelectedFund(null)}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main: 13F Change Log Table */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Significant Portfolio Changes
                            </CardTitle>
                            <CardDescription>
                                High-conviction moves (&gt;5% portfolio weight change) from tracked funds.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fund</TableHead>
                                        <TableHead>Ticker</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead className="text-right">Shares</TableHead>
                                        <TableHead className="text-right">Est. Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {aggregatedMoves.map((move, i) => (
                                        <TableRow
                                            key={i}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => {
                                                const fund = institutionalFunds.find(f => f.name === move.fund);
                                                if (fund) {
                                                    setSelectedFund(fund);
                                                    setShowSearchPanel(false);
                                                }
                                            }}
                                        >
                                            <TableCell className="font-medium">{move.fund}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">{move.ticker}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`flex items-center gap-2 text-xs font-semibold ${move.action === 'Buy' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {move.action === 'Buy' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                    {move.type}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm">{move.shares}</TableCell>
                                            <TableCell className="text-right font-mono text-sm text-muted-foreground">{move.value}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Heatmap */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Sector Heatmap
                            </CardTitle>
                            <CardDescription>
                                Aggregate exposure across all tracked "Superinvestors".
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 relative overflow-hidden rounded-md border border-dashed">
                            <div className="absolute inset-0 flex flex-wrap content-start p-1 gap-1">
                                <div className="h-[60%] w-[40%] bg-blue-500/20 flex flex-col items-center justify-center border border-blue-500/30 text-xs font-bold text-blue-500 hover:bg-blue-500/30 transition-colors cursor-pointer">
                                    Technology (40%)
                                    <span className="text-[10px] font-normal opacity-70">+2.5% QoQ</span>
                                </div>
                                <div className="h-[60%] w-[30%] bg-emerald-500/20 flex flex-col items-center justify-center border border-emerald-500/30 text-xs font-bold text-emerald-500 hover:bg-emerald-500/30 transition-colors cursor-pointer">
                                    Financials (30%)
                                    <span className="text-[10px] font-normal opacity-70">+1.2% QoQ</span>
                                </div>
                                <div className="h-[40%] w-[25%] bg-amber-500/20 flex flex-col items-center justify-center border border-amber-500/30 text-xs font-bold text-amber-500 hover:bg-amber-500/30 transition-colors cursor-pointer">
                                    Cons. Disc (15%)
                                </div>
                                <div className="h-[40%] w-[45%] bg-red-500/20 flex flex-col items-center justify-center border border-red-500/30 text-xs font-bold text-red-500 hover:bg-red-500/30 transition-colors cursor-pointer">
                                    Energy (10%)
                                    <span className="text-[10px] font-normal opacity-70">-3.4% QoQ</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Conviction Index */}
                <div className="space-y-6">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Conviction Index
                            </CardTitle>
                            <CardDescription>
                                Stocks where funds have &gt;10% portfolio allocation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { ticker: "MSFT", fund: "Bill & Melinda Gates", weight: "31.4%" },
                                { ticker: "AAPL", fund: "Berkshire Hathaway", weight: "40.5%" },
                                { ticker: "GOOGL", fund: "TCI Fund Mgmt", weight: "18.2%" },
                                { ticker: "AMZN", fund: "Tiger Global", weight: "12.8%" },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center p-3 bg-card rounded-lg border border-border/50 shadow-sm cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => {
                                        const fund = institutionalFunds.find(f =>
                                            f.name.toLowerCase().includes(item.fund.toLowerCase().split(' ')[0])
                                        );
                                        if (fund) {
                                            setSelectedFund(fund);
                                            setShowSearchPanel(false);
                                        }
                                    }}
                                >
                                    <div>
                                        <div className="font-bold text-lg">{item.ticker}</div>
                                        <div className="text-xs text-muted-foreground">{item.fund}</div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="secondary" className="font-mono text-primary bg-primary/10 hover:bg-primary/20">
                                            {item.weight}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Recently Filed (Today)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { fund: "Viking Global", time: "2h ago" },
                                { fund: "Baupost Group", time: "4h ago" },
                                { fund: "Elliott Mgmt", time: "5h ago" },
                            ].map((f, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="font-medium">{f.fund}</span>
                                    <span className="text-muted-foreground text-xs">{f.time}</span>
                                </div>
                            ))}
                            <Button variant="link" className="w-full text-xs h-auto p-0 mt-2">View All Filings</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* AI Chat Slide Panel */}
            {selectedFund && (
                <FundChatSlidePanel
                    fund={selectedFund}
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </div>
    );
}
