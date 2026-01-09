import { useState } from "react";
import {
    PieChart,
    TrendingUp,
    Building2,
    FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import { FundSearch } from "./FundSearch";

type AssetClass = "equity" | "fixed_income" | "alternatives";

const MOCKED_FUNDS = [
    {
        id: "bridgewater",
        name: "Bridgewater Associates",
        type: "alternatives", // Global Macro
        aum: "$124B (Public Equity)",
        sentiment: "Defensive",
        topHolding: "Emerging Markets ETFs",
        recentMove: "Ray Dalio warns of 'debt crisis' in latest commentary.",
        description: "Global Macro strategy focusing on economic cycles. Recent commentary emphasizes a defensive stance amidst rising volatility and debt concerns.",
        sources: [
            { label: "Research: A Wealth of Opportunity", url: "https://www.bridgewater.com/research-and-insights" },
            { label: "Dalio on Debt (LinkedIn)", url: "https://www.linkedin.com/pulse/big-cycle-united-states-dollar-ray-dalio" }
        ],
        lastUpdated: "Dec 2025"
    },
    {
        id: "pimco",
        name: "PIMCO Total Return",
        type: "fixed_income",
        aum: "$130B",
        sentiment: "Bearish on Long-End",
        topHolding: "5Y US Treasury Notes",
        recentMove: "Short Duration bias; Reduced 30Y Bond exposure.",
        description: "Active management in core bonds. Recently focusing on intermediate duration (5-10Y) while underweighting long-dated treasuries due to inflation risks. Heavy allocation to securitized assets (MBS).",
        sources: [
            { label: "Charting the Year Ahead 2026", url: "https://www.pimco.com/en-us/insights" },
            { label: "Morningstar Analysis", url: "https://www.morningstar.com/funds/xnas/pttrx/analysis" }
        ],
        lastUpdated: "Nov 2025"
    },
    {
        id: "fidelity",
        name: "Fidelity Total Bond",
        type: "fixed_income",
        aum: "$45B+",
        sentiment: "Risk-On (Credit)",
        topHolding: "Inv. Grade Corp Bonds",
        recentMove: "Overweight Corporate Credit & High Yield",
        description: "Core Plus strategy. Recently overweight risk assets, favoring intermediate investment-grade corporate credit and high-yield securities over government treasuries, betting on a successful soft landing.",
        sources: [
            { label: "Fidelity ETF Research (FBND)", url: "https://digital.fidelity.com/prgw/digital/research/quote/dashboard/summary?symbol=FBND" },
            { label: "Market Review Q3 2025", url: "https://www.fidelity.com/learning-center/wealth-management-insights/market-insights-quarterly-market-update" }
        ],
        lastUpdated: "Q3 2025"
    },
    {
        id: "oakmark",
        name: "Oakmark Select",
        type: "equity",
        aum: "$5B",
        sentiment: "Value / Contrarian",
        topHolding: "First Citizens BancShares",
        recentMove: "Bought: Deere & Co, Airbnb. Sold: Salesforce.",
        description: "Concentrated value fund. Significant recent portfolio rotation: added to consumer discretionary (Airbnb) and industrials (Deere) while trimming unexpected tech gains.",
        sources: [
            { label: "Oakmark Commentary Q3 '25", url: "https://oakmark.com/news-insights/" },
            { label: "13F Filing (WhaleWisdom)", url: "https://whalewisdom.com/filer/harris-associates-l-p" }
        ],
        lastUpdated: "Q3 2025"
    },
    {
        id: "sequoia",
        name: "Ruane Cunniff (Sequoia)",
        type: "equity",
        aum: "$6B",
        sentiment: "Pivot to US Tech",
        topHolding: "Alphabet (GOOGL)",
        recentMove: "Sold: Rolls-Royce. Bought: TSLA, Meta, Alphabet.",
        description: "Major strategic shift in Q3 2025. Eliminated long-held international compounders (Rolls-Royce, UMG) to pivot aggressively into US Mega-Cap Tech (Alphabet, Meta, Taiwan Semi).",
        sources: [
            { label: "Sequoia Shareholder Letter Q3 '25", url: "https://www.sequoiafund.com/resources" },
            { label: "13F Filing (SEC)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000086968" }
        ],
        lastUpdated: "Q3 2025"
    }
];

import { StockSearch } from "./StockSearch";
import { motion, AnimatePresence } from "motion/react";

export function FundResearch() {
    const [activeTab, setActiveTab] = useState<AssetClass>("equity");
    const [searchMode, setSearchMode] = useState<'fund' | 'stock'>('fund');

    const filteredFunds = MOCKED_FUNDS.filter(f => f.type === activeTab);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="bg-card/30 border-b border-border/60 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-heading font-bold mb-2">Fund Research</h1>
                            <p className="text-muted-foreground text-lg max-w-2xl">
                                Analyze market flows. Decrypt the "Smart Money" across asset classes.
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">

                {/* Research Tool Selector */}
                <div className="flex justify-center mb-8">
                    <div className="bg-muted/30 p-1 rounded-full inline-flex">
                        <button
                            onClick={() => setSearchMode('fund')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${searchMode === 'fund' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Fund Intelligence
                        </button>
                        <button
                            onClick={() => setSearchMode('stock')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${searchMode === 'stock' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Stock Analysis
                        </button>
                    </div>
                </div>

                {/* AI Research Integration */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {searchMode === 'fund' ? (
                            <motion.div
                                key="fund-search"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FundSearch />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="stock-search"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <StockSearch />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Divider */}
                <div className="my-12 border-t border-border/40" />

                {/* Asset Class Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-border/40 pb-1">
                    <button
                        onClick={() => setActiveTab("equity")}
                        className={`px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative ${activeTab === 'equity' ? 'bg-card text-primary border-t border-x border-border/60' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Public Equity
                        </div>
                        {activeTab === 'equity' && <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-card" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("fixed_income")}
                        className={`px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative ${activeTab === 'fixed_income' ? 'bg-card text-primary border-t border-x border-border/60' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Fixed Income
                        </div>
                        {activeTab === 'fixed_income' && <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-card" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("alternatives")}
                        className={`px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative ${activeTab === 'alternatives' ? 'bg-card text-primary border-t border-x border-border/60' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <div className="flex items-center gap-2">
                            <PieChart className="w-4 h-4" />
                            Alternatives (PE/RE/Credit)
                        </div>
                        {activeTab === 'alternatives' && <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-card" />}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Fund List */}
                    <div className="lg:col-span-2 space-y-6">
                        {filteredFunds.map(fund => (
                            <Dialog key={fund.id}>
                                <DialogTrigger asChild>
                                    <Card className="hover:border-primary/30 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                                        {fund.name}
                                                        <Badge variant="secondary" className="text-[10px]">13F</Badge>
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">AUM: <span className="text-foreground font-medium">{fund.aum}</span></p>
                                                </div>
                                                <Badge className={`${fund.sentiment.includes('Bullish') ? 'bg-green-500/10 text-green-500' : fund.sentiment.includes('Bearish') ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'} border-transparent`}>
                                                    {fund.sentiment}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-6 bg-muted/30 p-4 rounded-lg">
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                                                        {fund.type === 'equity' ? 'Top Holding' : 'Key Focus'}
                                                    </div>
                                                    <div className="font-semibold">{fund.topHolding}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                                                        {fund.type === 'equity' ? 'Recent Move' : 'Latest Intelligence'}
                                                    </div>
                                                    <div className="font-semibold text-primary text-sm line-clamp-3">
                                                        {fund.recentMove}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                                                <span className="text-[10px] text-muted-foreground">Updated: {fund.lastUpdated}</span>
                                                <span className="text-xs text-primary group-hover:underline">Click for details</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl bg-card border-border/50">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-2xl">
                                            {fund.name}
                                            <Badge variant="outline" className="text-sm font-normal">{fund.type.replace('_', ' ').toUpperCase()}</Badge>
                                        </DialogTitle>
                                        <DialogDescription className="text-lg mt-2">
                                            {fund.recentMove}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-6 py-4">
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2 text-primary uppercase tracking-wide">Strategy & Outlook</h4>
                                            <p className="text-muted-foreground leading-relaxed">
                                                {fund.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-muted/30 p-4 rounded-lg">
                                                <div className="text-xs text-muted-foreground mb-1 uppercase">Sentiment</div>
                                                <div className="font-semibold">{fund.sentiment}</div>
                                            </div>
                                            <div className="bg-muted/30 p-4 rounded-lg">
                                                <div className="text-xs text-muted-foreground mb-1 uppercase">AUM</div>
                                                <div className="font-semibold">{fund.aum}</div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold mb-2 text-primary uppercase tracking-wide">Sources</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {fund.sources.map((source, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={source.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-xs bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-full hover:bg-secondary transition-colors"
                                                    >
                                                        {source.label}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ))}
                        {filteredFunds.length === 0 && (
                            <div className="text-center py-20 bg-muted/20 border border-dashed rounded-xl">
                                <p className="text-muted-foreground">No funds tracking specifically for this category yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: AI Sentiment & News */}
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    AI Sentiment Pulse
                                </CardTitle>
                                <CardDescription>
                                    Scanning Reddit (r/SecurityAnalysis), X, and Financial News for {activeTab === 'equity' ? 'Stock' : activeTab === 'fixed_income' ? 'Bond' : 'Alt'} sentiment.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Positive Mentions</span>
                                    <span className="font-bold text-green-500 tabular-nums">
                                        {activeTab === 'equity' ? '1,240' : activeTab === 'fixed_income' ? '450' : '890'}
                                    </span>
                                </div>
                                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                    <div className={`h-full ${activeTab === 'equity' ? 'bg-green-500 w-2/3' : activeTab === 'fixed_income' ? 'bg-red-500 w-1/4' : 'bg-yellow-500 w-1/2'}`} />
                                </div>

                                <div className="pt-4 border-t border-border/50">
                                    <div className="text-xs font-medium text-muted-foreground mb-2">Trending Topics</div>
                                    <div className="flex flex-wrap gap-2">
                                        {activeTab === 'equity' ? (
                                            <>
                                                <Badge variant="outline">#AI_Capex</Badge>
                                                <Badge variant="outline">#GLP1</Badge>
                                                <Badge variant="outline">#RateCuts</Badge>
                                            </>
                                        ) : activeTab === 'fixed_income' ? (
                                            <>
                                                <Badge variant="outline">#YieldCurve</Badge>
                                                <Badge variant="outline">#JunkBonds</Badge>
                                                <Badge variant="outline">#Duration</Badge>
                                            </>
                                        ) : (
                                            <>
                                                <Badge variant="outline">#PrivateCredit</Badge>
                                                <Badge variant="outline">#CommericalRealEstate</Badge>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="w-5 h-5" />
                                    Latest Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="group cursor-pointer">
                                        <h4 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                                            {activeTab === 'equity' ? 'Why Value Investing is Making a Comeback in 2025' :
                                                activeTab === 'fixed_income' ? 'Bond Market Signals Recession Risk Rising' :
                                                    'Private Equity Dry Powder Reaches All-Time High'}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                            <span>Bloomberg</span>
                                            <span>•</span>
                                            <span>2h ago</span>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full text-xs mt-2">View All News</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div >
    );
}
